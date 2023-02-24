import mongoose from "mongoose";
import express from "express";

export const badRequestHandler = (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    if (err instanceof mongoose.Error.ValidationError) {
        res.status(400).send({ err: err.message });
    } else {
        next(err);
    }
};
export const notFoundHandler = (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    if (err.status === 404) {
        res.status(404).send({ err: err.message });
    } else {
        next(err);
    }
};

export const genericErrorHandler = (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    console.log(err);
    res.status(500).send({ err: "Generic Server Error" });
};

module.exports = {
    badRequestHandler,
    notFoundHandler,
    genericErrorHandler,
};
