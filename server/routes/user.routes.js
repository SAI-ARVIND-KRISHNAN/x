import express from 'express';
import protectedRoute  from '../middleware/protectRoute.middleware.js';
import { getUserProfile , followUnfollowUser, getSuggestedUsers, updateUser, getUsers} from '../controllers/user.controllers.js';

const userRouter = express.Router();

userRouter.get("/profile/:username", protectedRoute, getUserProfile);
userRouter.get("/suggested", protectedRoute, getSuggestedUsers);
userRouter.get("/getUsers/:username", protectedRoute, getUsers);
userRouter.post("/follow/:id", protectedRoute, followUnfollowUser);
userRouter.post("/update", protectedRoute, updateUser);

export default userRouter;