import express from 'express';
import { getAllSportsEvents } from '../controllers/ticketmasterController';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const events = await getAllSportsEvents();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router; 