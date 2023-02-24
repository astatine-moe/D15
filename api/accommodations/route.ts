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
import { UserModel, IUser } from "../user/model";
import { AccommodationModel, IAccommodation } from "./model";

const router = express.Router();

router.get(
    "/",
    verifyAccessToken,
    verifyLoggedIn,
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const accommodations = await AccommodationModel.find();
            res.send(accommodations);
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/:id",
    verifyAccessToken,
    verifyLoggedIn,
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const accommodation = await AccommodationModel.findById(
                req.params.id
            );
            if (!accommodation) {
                throw createHttpError(404, "Accommodation not found");
            }
            res.send(accommodation);
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/",
    verifyAccessToken,
    verifyLoggedIn,
    verifyHost,
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const accommodation = new AccommodationModel(req.body);
            accommodation.host = req.user._id;
            const savedAccommodation = await accommodation.save();
            res.send(savedAccommodation);
        } catch (err) {
            next(err);
        }
    }
);

router.put(
    "/:id",
    verifyAccessToken,
    verifyLoggedIn,
    verifyHost,

    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const accommodation = await AccommodationModel.findById(
                req.params.id
            );
            if (!accommodation) {
                throw createHttpError(404, "Accommodation not found");
            }
            if (accommodation.host.toString() !== req.user._id.toString()) {
                throw createHttpError(403, "Unauthorized");
            }
            Object.assign(accommodation, req.body);
            const savedAccommodation = await accommodation.save();
            res.send(savedAccommodation);
        } catch (err) {
            next(err);
        }
    }
);

router.delete(
    "/:id",
    verifyAccessToken,
    verifyLoggedIn,
    verifyHost,
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            const accommodation = await AccommodationModel.findById(
                req.params.id
            );
            if (!accommodation) {
                throw createHttpError(404, "Accommodation not found");
            }
            if (accommodation.host.toString() !== req.user._id.toString()) {
                throw createHttpError(403, "Unauthorized");
            }
            await accommodation.delete();

            res.send("Accommodation deleted");
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
