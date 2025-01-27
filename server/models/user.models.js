import mongoose, { model } from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        require: true,
        minLength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId, // 16 charecters
            ref: "User",
            default: []
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId, // 16 charecters
            ref: "User",
            default: []
        }
    ],
    profileImg: {
        type: String,
        default: "",
    },
    coverImg: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    link: {
        type:String,
        default:""
    }
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;