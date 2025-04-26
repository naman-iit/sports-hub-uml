import express from "express";
import { generateEventSummary } from "../controllers/openaiController";
import { authorizeUser } from "../middlewares/authorizeUser";
const router = express.Router();

// Generate a summary for a sports event
router.post("/summary", authorizeUser, async (req, res) => {
  try {
    console.log("Generating summary for event:", req.body);
    const summary = await generateEventSummary(
      req.body.homeTeam,
      req.body.awayTeam,
      req.body.date,
      req.body.venue,
      req.body.sportType
    );
    res.json(summary);
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({
      error: "Failed to generate summary",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

export default router;
