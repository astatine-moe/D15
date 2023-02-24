import express from "express";
import createHttpError from "http-errors";
import {
    createAccessToken,
    createRefreshToken,
    verifyAccessToken,
    verifyGuest,
    verifyHost,
    verifyRefreshToken,
    verifyLoggedIn,
    verifyLoggedOut,
} from "../../jwt";
import { UserModel, IUser } from "./model";
import { AccommodationModel, IAccommodation } from "../accommodations/model";

const router = express.Router();

const User = UserModel;

router.post(
    "/register",
    verifyLoggedOut,
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const { email, password, role } = req.body;
            const user = new User({ email, password, role });
            const savedUser = await user.save();
            res.send(savedUser);
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/login",
    verifyLoggedOut,
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        // 1. Check if user exists
        // 2. Check if password is correct
        // 3. Create tokens
        // 4. Send tokens
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                throw createHttpError(401, "Invalid credentials");
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                throw createHttpError(401, "Invalid credentials");
            }

            const accessToken = createAccessToken(user);
            const refreshToken = createRefreshToken(user);

            //save tokens to cookie
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                sameSite: "none",
                secure: true,
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                sameSite: "none",
                secure: true,
            });

            res.send({ accessToken });
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/refresh",
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        //check if refresh token exists
        //check if refresh token is valid
        //create new access token
        //send new access token
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                throw createHttpError.Unauthorized();
            }
            const { accessToken } = await verifyRefreshToken(refreshToken);
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                sameSite: "none",
                secure: true,
            });
            res.send({ accessToken });
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/logout",
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.send("Logged out");
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/me",
    verifyAccessToken,
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const { _id } = req.user;
            const user = await User.findById(_id);
            res.send(user);
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/me/accommodations",
    verifyAccessToken,
    verifyHost,
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const id = req.payload.id;

            const user = await User.findById(id);
            if (!user) {
                throw createHttpError(404, "User not found");
            }
            const accommodations = await AccommodationModel.find({ host: id });

            res.send(accommodations);
        } catch (e) {
            next(e);
        }
    }
);

export default router;
