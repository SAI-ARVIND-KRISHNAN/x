import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

import User from "../models/user.models.js ";
import Notification from "../models/notification.models.js";

export const getUserProfile = async (req, res) => {
    //accessing username parameter ':username'
    const {username} = req.params;
    try {
        const user = await User.findOne({username}).select("-password");
        if (!user) {
            return res.status(400).json({message: "User not found"})
        }
        res.status(200).json(user)
    } catch (error) {
        console.log("Error in getUserProfile controller", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);
        //if any one of the user is not found
        if (!userToModify || !currentUser){
            return res.status(400).json({error: "user not found"})
        }
        //if both current user and user to modify are same, it should not be allowed i..e.. following yourself is not allowed
        if (id === req.user._id.toString()){
            return res.status(400).json({error : "You cant follow or unfollow yourself!"});
        }

        //flag if current user already following.
        const ifFollowing = currentUser.following.includes(id);

        if (ifFollowing){
            //unfollow user
            await User.findByIdAndUpdate(id, {$pull: { followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$pull: { following: id}});
            res.status(200).json({message: "user unfollowed successfully"});
        } else {
            //follow user. we push new user to the following and followers array 
            await User.findByIdAndUpdate(id, {$push: { followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$push: { following: id}});
            //send notification
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: id
            });
             
            await newNotification.save();

            res.status(200).json({message: "user followed successfully"});
        }

    } catch (error) {
        console.log("Error in followUnfollowUser controller", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const usersFollowedByMe = await User.findById(userId).select("following");

        //get 10 users that is not the current user
        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne: userId},
                },
            },
            {$sample: {size: 10}},
        ]);

        //from the random 10 users filter out the uses that is not followed by current user.
        const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id))
        //get 4 users from those filtered users 
        const suggestedUsers = filteredUsers.slice(0, 4);

        //set password null
        suggestedUsers.forEach(user=>user.password=null);

        res.status(200).json(suggestedUsers);
    } catch(error) {
        console.log("Error in getSuggestedUsers controller", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const updateUser = async (req, res) => {
    
        const {username, fullName, email, currentPassword, newPassword, bio, link} = req.body;
        let {profileImg, coverImg} = req.body;

        const userId = req.user._id;

        try {
            let user = await User.findById(userId);
            if (!user) return res.status(404).json({message: "User not found"});

            if ((!newPassword && currentPassword) || (!currentPassword && newPassword)){
                return res.status(400).json({error: "Please provide both the current password and the new password"});
            }

            if (currentPassword && newPassword) {
                const isMatch = bcrypt.compareSync(currentPassword, user.password);

                if (!isMatch) return res.status(400).json({error: "Current password is incorrect"});
                if (newPassword.length < 6) return res.status(400).json({error: "Password must be atleast 6 charecters long"});

                const salt = bcrypt.genSaltSync(10);
                user.password = bcrypt.hashSync(newPassword, salt);
            }

                if (profileImg){
                    //if user already has a profile img, we have to delete the old one and insert a new one
                    if (user.profileImg) {
                        //to delete an image we need to get the id of the image from the ulr which is like ".../.../<id>.png"
                        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
                    }

                    const uploadProfileImg = await cloudinary.uploader.upload(profileImg);
                    //assign the new image url to coverImg
                    coverImg = uploadProfileImg.secure_url;
                }

                if (coverImg){

                    if (user.coverImg) {
                        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
                    }

                    const uploadCoverImg = await cloudinary.uploader.upload(coverImg);
                    //assign the new image url to coverImg
                    coverImg = uploadCoverImg.secure_url;
                }

                user.fullName = fullName || user.fullName;
                user.email = email || user.email;
                user.username = username || user.username;
                user.bio = bio || user.bio;
                user.link = link || user.link;
                user.profileImg = profileImg || user.profileImg;
                user.coverImg = coverImg || user.coverImg;

                //save to db
                user = await user.save();

                //making pass is null when sending response to client
                user.password = null

                return res.status(200).json(user);

            
        } catch (error) {
            console.log("Error in updateUser controller", error);
            res.status(500).json({error: "Internal Server Error"});
        }

}