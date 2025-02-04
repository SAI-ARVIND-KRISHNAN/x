import User from "../models/user.models.js";
import Post from "../models/post.models.js";
import Notification from "../models/notification.models.js";

import { v2 as cloudinary} from "cloudinary";

export const createPost = async(req, res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();

        const user = User.findById(userId).select("-password");

        if (!user) return res.status(404).json({message: "User not found"});

        if (!text && !img) return res.status(400).json({message: "Post must have text or image"});

        if (img){
            const uploadResponse = await cloudinary.uploader.upload(img);
            img = uploadResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text,
            img
        });

        await newPost.save();

        res.status(201).json(newPost);

    } catch (error) {
        console.log("Error in createPost controller", error);
        res.status(500).json({error: "Internal server error"})
    }
}
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) return res.status(404).json({error: "Post not found"});
        if (post.user.toString() !== req.user._id.toString()) return res.status(401).json({error: "You are not authorized to delete this post"});

        if (post.img) {
            const imgId = post.img.post("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({message: "Post delete successfully"});
    } catch (error) {
        console.log("Error in deletePost controller: ", error);
        res.status(500).json({error: "Internal server error"});
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({error: "Text field is required!"});
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({error: "Post not found"});
        }

        const comments = {user: userId, text};

        post.comments.push(comments);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.log("Error in commentOnPost controller:", error);
        return res.status(500).json({error: "Internal server error"});
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const {id:postId} = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({error: "Post not found"});
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost){
            //unlike post
            await Post.updateOne({_id:postId}, {$pull: {likes: userId}});
            await User.updateOne({_id:userId}, {$pull: {likedPosts: postId}});
            res.status(200).json({message: "Post unliked"});
        } else {
            //like post
            post.likes.push(userId);
            await User.updateOne({_id:userId}, {$push: {likedPosts: postId}});
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user._id,
                type: 'like'
            });
            await notification.save();

            res.status(200).json({message: "Post liked"});
        }

    } catch (error) {
        console.log("Error in likeUnlikePost controller:", error);
        return res.status(500).json({error: "Internal server error"});
    }
}

export const getAllPosts = async(req, res) => {
    try {
        //get posts as sort as recent to old. the populate function replaces the "user: <userId>" with "user: <wholeUserObject>" we also remove the password form the user object. we also populate the comments the user made too
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "user", 
            select: "-password",
            strictPopulate: false //using strict populate because we need to get the user details from a different file/scheme
        }).populate({
            path: "comment.user",
            select: "-password",
            strictPopulate: false
        });

        if (posts.length === 0){
            return res.status(200).json([]);
        }

        res.status(200).json(posts)
    } catch (error) {
        console.log("Error in getAllPosts controller:", error);
        return res.status(500).json({error: "Internal server error"});
    }
}

export const getLikedPosts = async(req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({error: "User not found"});

        console.log(user.likedPosts);

        //get all the contents of the posts whose postIds are in the user's liked post
        const likedPosts = await Post.find({_id: {$in: user.likedPosts}})
        .populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(likedPosts);
    } catch (error) {
        console.log("Error in getLikedPosts controller:", error);
        return res.status(500).json({error: "Internal server error"});
    }
}

export const getFollowingPosts = async(req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({error: "User not found"});
        
        const following = user.following;

        //get posts where the userId of post is in following
        const feedPosts = await Post.find({user: {$in: following}})
        .sort({created: -1}) //sort by most recent
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(feedPosts);

    } catch (error) {
        console.log("Error in getFollowingPosts controller:", error);
        return res.status(500).json({error: "Internal server error"});
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const {username} = req.params;

        const user = await User.findOne({username});
        if (!user) return res.status(404).json({error: "username not found"});
        
        const posts = await Post.find({user: user._id})
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(posts);
        
    } catch (error) {
        console.log("Error in getUserPosts controller:", error);
        return res.status(500).json({error: "Internal server error"});
    }
}

export const bookmarkPost = async (req, res) => {

    try {
        const userId = req.user._id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        const user = await User.findById(userId).select("-password");

        if (!post){
            return res.status(404).json({error: "Post not found"});
        }

        const isBookmarked =  user.bookmarked.includes(postId);

        if (!isBookmarked){
            await User.updateOne({_id:userId}, {$push: {bookmarked: postId}});
            res.status(200).json({message : "bookmarked this post"});
        } else {
            await User.updateOne({_id:userId}, {$pull: {bookmarked: postId}});
            res.status(200).json({message : "unmarked this post"});
        }
    } catch (error) {
        console.log("Error in getBookmarkedPost controller", error);
        res.status(500).json({error: "Internal Server Error"});
    }
    
}

export const getBookmarkedPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({error: "user not found"});
        }
        console.log(user.bookmarked)
        const bookmarkedPosts = user.bookmarked;
        res.status(200).json(bookmarkedPosts);

    } catch (error) {
        console.log("Error in getBookmarkedPost controller", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}