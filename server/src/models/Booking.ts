import { Schema, model, Document, Types } from "mongoose";

export interface IBooking extends Document {
  seatMap: Types.ObjectId;
  seats: Types.ObjectId[];
  user: Types.ObjectId;
  totalAmount: number;
  bookedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  status: string;
}

const BookingSchema = new Schema<IBooking>(
  {
    seatMap: {
      type: Schema.Types.ObjectId,
      ref: "SeatMap",
      required: true,
      index: true,
    },
    seats: [
      {
        type: Schema.Types.ObjectId,
        ref: "Seat",
        required: true,
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Booking = model<IBooking>("Booking", BookingSchema);
