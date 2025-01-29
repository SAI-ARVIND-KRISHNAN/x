import express from 'express';
import protectedRoute  from '../middleware/protectRoute.middleware.js';
import { getUserProfile , followUnfollowUser, getSuggestedUsers, updateUser} from '../controllers/user.controllers.js';

const userRouter = express.Router();

userRouter.get("/profile/:username", protectedRoute, getUserProfile);
userRouter.post("/follow/:id", protectedRoute, followUnfollowUser);
userRouter.get("/suggested", protectedRoute, getSuggestedUsers);
userRouter.post("/update", protectedRoute, updateUser);

export default userRouter;