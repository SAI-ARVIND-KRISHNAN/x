import express from 'express';

import protectRoute from '../middleware/protectRoute.middleware.js';
import { createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts} from '../controllers/post.controllers.js';

const postRouter = express();

postRouter.get('/all', protectRoute, getAllPosts);
postRouter.get('/likes/:id', protectRoute, getLikedPosts);
postRouter.get('/following', protectRoute, getFollowingPosts);
postRouter.get('/user/:username', protectRoute, getUserPosts);
postRouter.post('/create', protectRoute, createPost);
postRouter.post('/comment/:id',  protectRoute, commentOnPost);
postRouter.post('/like/:id',  protectRoute, likeUnlikePost);
postRouter.delete('/:id', protectRoute, deletePost);

export default postRouter;