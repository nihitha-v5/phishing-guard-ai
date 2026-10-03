import express from 'express';
import { runFullAnalysis } from '../engine/aiProvider.js';
import { recordAnalysisEvent } from '../store/telemetryStore.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Body: { sender, subject, body, urls, department, attachments, organizationDomain, autoLogTelemetry }
 */
router.post('/', async (req, res) => {
  try {
    const {
      sender = '',
      subject = '',
      body = '',
      urls = [],
      department = 'Finance',
      attachments = [],
      organizationDomain = 'acme-corp.com',
      autoLogTelemetry = true
    } = req.body;

    if (!sender && !subject && !body && urls.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide at least a sender, subject, message body, or URL to analyze.'
      });
    }

    const report = await runFullAnalysis({
      sender,
      subject,
      body,
      urls,
      attachments,
      organizationDomain
    });

    // Automatically record to telemetry event store if requested
    let eventRecord = null;
    if (autoLogTelemetry !== false) {
      eventRecord = recordAnalysisEvent({
        sender,
        subject,
        department,
        riskScore: report.score,
        riskLevel: report.riskLevel,
        classification: report.classification,
        confidence: report.confidence,
        indicators: report.indicators,
        userAction: 'ANALYZED',
        coachingCompleted: false,
        coachingTopic: report.coaching && report.coaching[0] ? report.coaching[0].title : 'General Security'
      });
    }

    return res.json({
      status: 'success',
      report: {
        ...report,
        eventId: eventRecord ? eventRecord.id : null
      }
    });
  } catch (error) {
    console.error('Error during phishing analysis:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to complete analysis. Check server logs for details.',
      error: error.message
    });
  }
});

export default router;
