// src/models/SeatMap.ts
import { Schema, model, Document } from "mongoose";

export interface ISeatMap extends Document {
  name: string;
  layoutConfig: {
    top: { rows: number; seatsPerRow: number };
    bottom: { rows: number; seatsPerRow: number };
    left: { rows: number; seatsPerRow: number };
    right: { rows: number; seatsPerRow: number };
  };
  createdAt: Date;
  updatedAt: Date;
}

const SeatMapSchema = new Schema<ISeatMap>(
  {
    name: { type: String, required: true, unique: true },
    layoutConfig: {
      top: { rows: Number, seatsPerRow: Number },
      bottom: { rows: Number, seatsPerRow: Number },
      left: { rows: Number, seatsPerRow: Number },
      right: { rows: Number, seatsPerRow: Number },
    },
  },
  { timestamps: true }
);

export const SeatMap = model<ISeatMap>("SeatMap", SeatMapSchema);
