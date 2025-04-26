// src/routes/getSeatMap.ts
import { Router, Request, Response, NextFunction } from "express";
import { SeatMap } from "../models/SeatMap";
import { Seat } from "../models/Seats";
import { authorizeUser } from "../middlewares/authorizeUser";
const router = Router();

/**
 * GET /seat-map/:id
 * Returns the seat map configuration and all seats for a given stadium ID.
 */
router.get(
  "/seat-map/:id",
  authorizeUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Fetch seat map configuration
      const seatMap = await SeatMap.findById(id).lean();
      if (!seatMap) {
        return res.status(404).json({ message: "SeatMap not found" });
      }

      // Fetch all seats belonging to this seatMap
      const seats = await Seat.find({ seatMap: id }).lean();

      return res.json({ seatMap, seats });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
