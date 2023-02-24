import mongoose from "mongoose";

export interface IAccommodation extends mongoose.Document {
    name: string;
    host: mongoose.Types.ObjectId;
    description: string;
    maxGuests: number;
    city: string;
}

const schema = new mongoose.Schema<IAccommodation>({
    name: {
        type: String,
        required: true,
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    description: {
        type: String,
        required: true,
    },
    maxGuests: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
});

export const AccommodationModel = mongoose.model<IAccommodation>(
    "Accommodation",
    schema
);
