const express = require('express');
const aiService = require('../services/aiService');
const Session = require('../models/Session');
const { auth } = require('../middleware/auth');
const { validateAIPrompt } = require('../middleware/validation');

const router = express.Router();

// Generate component
router.post('/generate', auth, validateAIPrompt, async (req, res) => {
  try {
    const { prompt, sessionId, context } = req.body;

    // Generate component using AI
    const result = await aiService.generateComponent(prompt, context);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // If sessionId is provided, save to session
    if (sessionId) {
      const session = await Session.findOne({
        _id: sessionId,
        userId: req.user._id,
        isActive: true
      });

      if (session) {
        // Add user message
        await session.addMessage('user', prompt, { type: 'component-generation' });
        
        // Add AI response
        await session.addMessage('assistant', result.raw, { type: 'component-generation' });
        
        // Update component
        await session.updateComponent(result.jsx, result.css, {
          generatedFrom: prompt,
          timestamp: new Date()
        });

        // Emit socket event
        const io = req.app.get('io');
        io.to(sessionId).emit('component-generated', {
          sessionId,
          component: result,
          message: { role: 'assistant', content: result.raw }
        });
      }
    }

    res.json({
      message: 'Component generated successfully',
      component: result
    });
  } catch (error) {
    console.error('Generate component error:', error);
    res.status(500).json({ error: 'Failed to generate component' });
  }
});

// Generate component with streaming
router.post('/generate/stream', auth, validateAIPrompt, async (req, res) => {
  try {
    const { prompt, sessionId, context } = req.body;

    // Set headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    let fullContent = '';
    let finalResult = null;

    await aiService.generateComponentStream(prompt, context, (chunk, status) => {
      if (status.error) {
        res.write(`data: ${JSON.stringify({ error: status.error })}\n\n`);
        res.end();
        return;
      }

      if (chunk) {
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
      }

      if (status.done) {
        finalResult = status.result;
        res.write(`data: ${JSON.stringify({ done: true, result: finalResult })}\n\n`);
        res.end();

        // Save to session if sessionId is provided
        if (sessionId && finalResult) {
          saveToSession(sessionId, req.user._id, prompt, finalResult, req.app);
        }
      }
    });

  } catch (error) {
    console.error('Stream generation error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate component' })}\n\n`);
    res.end();
  }
});

// Refine component
router.post('/refine', auth, validateAIPrompt, async (req, res) => {
  try {
    const { prompt, sessionId, context } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required for refinement' });
    }

    // Get current session and component
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.currentComponent.jsx) {
      return res.status(400).json({ error: 'No component to refine' });
    }

    // Refine component using AI
    const result = await aiService.refineComponent(
      prompt,
      session.currentComponent,
      context
    );

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // Add messages to session
    await session.addMessage('user', prompt, { type: 'component-refinement' });
    await session.addMessage('assistant', result.raw, { type: 'component-refinement' });

    // Update component
    await session.updateComponent(result.jsx, result.css, {
      refinedFrom: prompt,
      timestamp: new Date()
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(sessionId).emit('component-refined', {
      sessionId,
      component: result,
      message: { role: 'assistant', content: result.raw }
    });

    res.json({
      message: 'Component refined successfully',
      component: result
    });
  } catch (error) {
    console.error('Refine component error:', error);
    res.status(500).json({ error: 'Failed to refine component' });
  }
});

// Validate component
router.post('/validate', auth, async (req, res) => {
  try {
    const { jsx, css } = req.body;

    const validation = await aiService.validateComponent(jsx, css);

    res.json({
      validation
    });
  } catch (error) {
    console.error('Validate component error:', error);
    res.status(500).json({ error: 'Failed to validate component' });
  }
});

// Get AI suggestions
router.post('/suggestions', auth, async (req, res) => {
  try {
    const { currentComponent, context } = req.body;

    const suggestions = [
      'Make the component more responsive',
      'Add hover effects and transitions',
      'Improve accessibility with ARIA attributes',
      'Add loading states',
      'Make it more interactive',
      'Optimize for mobile devices',
      'Add error handling',
      'Improve the color scheme',
      'Add animations',
      'Make it more accessible'
    ];

    // Filter suggestions based on current component
    let filteredSuggestions = suggestions;
    if (currentComponent && currentComponent.jsx) {
      if (currentComponent.jsx.includes('hover')) {
        filteredSuggestions = filteredSuggestions.filter(s => !s.includes('hover'));
      }
      if (currentComponent.jsx.includes('aria-')) {
        filteredSuggestions = filteredSuggestions.filter(s => !s.includes('ARIA'));
      }
    }

    res.json({
      suggestions: filteredSuggestions.slice(0, 5)
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Helper function to save to session
async function saveToSession(sessionId, userId, prompt, result, app) {
  try {
    const session = await Session.findOne({
      _id: sessionId,
      userId,
      isActive: true
    });

    if (session) {
      // Add user message
      await session.addMessage('user', prompt, { type: 'component-generation' });
      
      // Add AI response
      await session.addMessage('assistant', result.raw, { type: 'component-generation' });
      
      // Update component
      await session.updateComponent(result.jsx, result.css, {
        generatedFrom: prompt,
        timestamp: new Date()
      });

      // Emit socket event
      const io = app.get('io');
      io.to(sessionId).emit('component-generated', {
        sessionId,
        component: result,
        message: { role: 'assistant', content: result.raw }
      });
    }
  } catch (error) {
    console.error('Save to session error:', error);
  }
}

module.exports = router; 