import mongoose from "mongoose";
import argon2 from "argon2";

export interface IUser extends mongoose.Document {
    email: string;
    password: string;
    role: string;
    refreshToken: string;
    accessToken: string;
    comparePassword: (password: string) => Promise<boolean>;
}

const schema: mongoose.Schema = new mongoose.Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["host", "guest"],
    },
    refreshToken: {
        type: String,
    },
    accessToken: {
        type: String,
    },
});

schema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    try {
        const hash = await argon2.hash(this.password);
        this.password = hash;
        next();
    } catch (err: any) {
        next(err);
    }
});

schema.methods.comparePassword = async function (password: string) {
    try {
        const isMatch = await argon2.verify(this.password, password);
        return isMatch;
    } catch (err) {
        return false;
    }
};

schema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.accessToken;
    return obj;
};

export const UserModel = mongoose.model<IUser>("User", schema);
