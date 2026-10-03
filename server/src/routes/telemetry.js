import express from 'express';
import { getTelemetry, updateEventAction } from '../store/telemetryStore.js';

const router = express.Router();

// GET /api/telemetry - Fetch all organizational telemetry
router.get('/', (req, res) => {
  try {
    const telemetryData = getTelemetry();
    res.json({
      status: 'success',
      data: telemetryData
    });
  } catch (err) {
    console.error('Error fetching telemetry:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve telemetry data.'
    });
  }
});

// POST /api/telemetry/action - Update protection action on an event
router.post('/action', (req, res) => {
  try {
    const { eventId, action, coachingCompleted } = req.body;
    if (!eventId || !action) {
      return res.status(400).json({
        status: 'error',
        message: 'eventId and action are required fields.'
      });
    }

    const updated = updateEventAction(eventId, action, coachingCompleted);
    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found.'
      });
    }

    res.json({
      status: 'success',
      event: updated
    });
  } catch (err) {
    console.error('Error recording telemetry action:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update telemetry action.'
    });
  }
});

export default router;
