import User from '../models/user.models.js'
import jwt from 'jsonwebtoken'

const protectRoute = async (req, res, next) => {
    try {
        //access jwt token from cookie
        const token = req.cookies.jwt;
        //console.log(token);
        if (!token){
            return res.status(401).json({error: "Unauthorized! no token provided"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //if token tampered
        if (!decoded){
            return res.status(401).json({error: "unauthorized: Invalid Token"})
        }

        //we get everything from use except the password
        const user = await User.findById(decoded.userId).select("-password");

        if (!user){
            return res.status(404).json({error: "User not found"})
        }

        //the old user had the password while the new user does not. so we authorize the user using this middleware using jwt.
        //remeber jwt is a way to transfer data safely while Auth0 etc.. are frameworks
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectedRoute Middleware", error.message);
        return res.status(500).json({error: "Internal Server Error"})
    }
}

export default protectRoute;