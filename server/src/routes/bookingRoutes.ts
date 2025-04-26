// add route for booking seats

import { Router, Request, Response } from "express";
import { Seat } from "../models/Seats";
import { Booking } from "../models/Booking";
import { SeatMap } from "../models/SeatMap";
import { authorizeUser } from "../middlewares/authorizeUser";
const router = Router();

router.post(
  "/book-seats",
  authorizeUser,
  async (req: Request, res: Response) => {
    try {
      const { eventId, seatIds } = req.body;
      const userId = req.user;

      // Fetch all seats with their details
      const seats = await Seat.find({ _id: { $in: seatIds } });

      // get booked seats from seatMap
      const seatMap = await SeatMap.findById(eventId);
      if (!seatMap) {
        return res.status(404).json({
          success: false,
          message: "Seat map not found",
        });
      }

      const totalAmount = seats.reduce((acc, seat) => acc + seat.price, 0);

      // Create the booking
      const booking = await Booking.create({
        seatMap: seatMap._id,
        seats: seatIds,
        totalAmount,
        user: userId,
        bookedAt: new Date(),
      });

      // Update seat availability
      await Seat.updateMany(
        { _id: { $in: seatIds } },
        { $set: { isAvailable: false } }
      );

      res.json({
        success: true,
        booking,
        message: "Seats booked successfully",
      });
    } catch (error: unknown) {
      console.error("Booking error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        success: false,
        message: "Failed to book seats",
        error: errorMessage,
      });
    }
  }
);

router.get("/", authorizeUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    const bookings = await Booking.find({ user: userId }).populate(
      "seatMap seats user"
    );
    res.json(bookings);
  } catch (error: unknown) {
    console.error("Booking error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      success: false,
      message: "Failed to get bookings",
      error: errorMessage,
    });
  }
});

export default router;
