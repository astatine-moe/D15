import jwt from "jsonwebtoken";
import { UserModel, IUser } from "./api/user/model";
import { HydratedDocument } from "mongoose";
import express from "express";
import createHttpError from "http-errors";

const User = UserModel;

const accessSecret = process.env.JWT_TOKEN;
const refreshSecret = process.env.JWT_REFRESH_TOKEN;

//interface for user
interface UserPayload {
    _id: string;
    email: string;
    role: string;
    refreshToken: string;
    accessToken: string;
}

interface verifyToken {
    accessToken: string;
    refreshToken: string;
}

export const createAccessToken = (user: UserPayload): Promise<string> => {
    return new Promise((resolve, reject) => {
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
        };
        jwt.sign(
            payload,
            accessSecret,
            { expiresIn: "15m" },
            (err: any, token: any) => {
                if (err) {
                    reject(err);
                }
                resolve(token);
            }
        );
    });
};

export const createRefreshToken = (user: UserPayload): Promise<string> => {
    return new Promise((resolve, reject) => {
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
        };
        jwt.sign(
            payload,
            refreshSecret,
            { expiresIn: "7d" },
            async (err: any, token: any) => {
                if (err) {
                    reject(err);
                }
                User.findById(payload.id).then(async (user: any) => {
                    user.refreshToken = token;

                    await user.save();
                    resolve(token);
                });
            }
        );
    });
};
export const verifyRefreshToken = (
    refreshToken: string
): Promise<verifyToken> => {
    return new Promise(async (resolve, reject) => {
        jwt.verify(refreshToken, refreshSecret, (err: any, payload: any) => {
            if (err) {
                return reject(err);
            }
            const userId = payload.id;
            User.findById(userId).then(async (user) => {
                if (!user) {
                    return reject(createHttpError(404, "User not found"));
                }
                if (user.refreshToken !== refreshToken) {
                    return reject(
                        createHttpError(404, "Refresh token is not valid")
                    );
                }
                const accessToken: string = await createAccessToken(user);
                resolve({ accessToken, refreshToken });
            });
        });
    });
};

export const verifyAccessToken = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    if (!req.headers["authorization"]) {
        return next(createHttpError(401));
    }
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    jwt.verify(token, accessSecret, (err, payload) => {
        if (err) {
            const message =
                err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
            return next(createHttpError.Unauthorized(message));
        }
        req.payload = payload;
        next();
    });
};

export const verifyHost = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    if (req.payload.role !== "host") {
        return next(createHttpError.Unauthorized());
    }
    next();
};

export const verifyGuest = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    if (req.payload.role !== "guest") {
        return next(createHttpError.Unauthorized());
    }
    next();
};
export const verifyLoggedIn = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    if (!req.payload) {
        return next(createHttpError.Unauthorized());
    }
    next();
};

export const verifyLoggedOut = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    if (req.payload) {
        return next(createHttpError.Unauthorized());
    }
    next();
};
