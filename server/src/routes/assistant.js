import express from 'express';
import { generateAssistantReply } from '../engine/aiProvider.js';

const router = express.Router();

/**
 * POST /api/assistant
 * Body: { message: string, context?: object }
 * Response: { status: 'success', reply: string, source: 'ai' | 'knowledge_base' }
 */
router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'A non-empty message string is required.'
      });
    }

    const result = await generateAssistantReply({ message, context });

    return res.json({
      status: 'success',
      reply: result.reply,
      source: result.source || 'ai'
    });
  } catch (error) {
    console.error('Error in /api/assistant:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process security assistant query.',
      reply: '🛡️ Assistant connection error: The security knowledge engine encountered a temporary issue. Please try again.',
      source: 'knowledge_base'
    });
  }
});

export default router;
