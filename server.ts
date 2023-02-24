import http from "http";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import expressCookieParser from "cookie-parser";
import path from "path";
import { badRequestHandler, notFoundHandler, genericErrorHandler } from "./err";
import { config } from "dotenv";
config();

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            MONGO_URI: string;
            JWT_TOKEN: string;
            JWT_REFRESH_TOKEN: string;
        }
    }
}

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on("error", () => {
    throw new Error(`unable to connect to database: ${process.env.MONGO_URI}`);
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//cookies
app.use(expressCookieParser());

// Routes
app.use("/products", require("./api/products/route"));
app.use("/products", require("./api/reviews/route"));

// Error handler
app.use(badRequestHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

// Start Express server
server.listen(app.get("port"), () => {
    console.log(
        "App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
    );
    console.log("Press CTRL-C to stop");
});
