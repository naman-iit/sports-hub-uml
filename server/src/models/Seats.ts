import { Schema, model, Document, Types } from "mongoose";
import { ISeatMap } from "./SeatMap";

export interface ISeat extends Document {
  seatMap: Types.ObjectId;
  section: "top" | "bottom" | "left" | "right";
  row: number;
  number: number;
  label: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  price: number;
}

const SeatSchema = new Schema<ISeat>(
  {
    seatMap: {
      type: Schema.Types.ObjectId,
      ref: "SeatMap",
      required: true,
      index: true,
    },
    section: {
      type: String,
      enum: ["top", "bottom", "left", "right"],
      required: true,
      index: true,
    },
    row: { type: Number, required: true, index: true },
    number: { type: Number, required: true, index: true },
    label: { type: String, required: true },
    isAvailable: { type: Boolean, default: true, index: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

// Ensure uniqueness per seat within a SeatMap
SeatSchema.index(
  { seatMap: 1, section: 1, row: 1, number: 1 },
  { unique: true }
);

export const Seat = model<ISeat>("Seat", SeatSchema);
