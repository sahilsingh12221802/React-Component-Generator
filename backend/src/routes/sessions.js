const express = require('express');
const Session = require('../models/Session');
const { auth } = require('../middleware/auth');
const { validateSession } = require('../middleware/validation');

const router = express.Router();

// Get all sessions for current user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ 
      userId: req.user._id,
      isActive: true 
    })
    .select('title description lastActivity createdAt messageCount currentComponent.version')
    .sort({ lastActivity: -1 });

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Get single session with full details
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Create new session
router.post('/', auth, validateSession, async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    const session = new Session({
      userId: req.user._id,
      title,
      description,
      tags: tags || []
    });

    await session.save();

    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update session
router.put('/:sessionId', auth, validateSession, async (req, res) => {
  try {
    const { title, description, tags, settings } = req.body;

    const session = await Session.findOneAndUpdate(
      {
        _id: req.params.sessionId,
        userId: req.user._id,
        isActive: true
      },
      {
        title,
        description,
        tags,
        settings: settings ? { ...req.body.settings } : undefined
      },
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      message: 'Session updated successfully',
      session
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete session (soft delete)
router.delete('/:sessionId', auth, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      {
        _id: req.params.sessionId,
        userId: req.user._id,
        isActive: true
      },
      { isActive: false },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Add message to session
router.post('/:sessionId/messages', auth, async (req, res) => {
  try {
    const { role, content, metadata } = req.body;

    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await session.addMessage(role, content, metadata);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(req.params.sessionId).emit('message-added', {
      sessionId: req.params.sessionId,
      message: { role, content, metadata, timestamp: new Date() }
    });

    res.json({
      message: 'Message added successfully',
      session
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Update component in session
router.put('/:sessionId/component', auth, async (req, res) => {
  try {
    const { jsx, css, metadata } = req.body;

    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await session.updateComponent(jsx, css, metadata);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(req.params.sessionId).emit('component-updated', {
      sessionId: req.params.sessionId,
      component: { jsx, css, metadata, version: session.currentComponent.version }
    });

    res.json({
      message: 'Component updated successfully',
      session
    });
  } catch (error) {
    console.error('Update component error:', error);
    res.status(500).json({ error: 'Failed to update component' });
  }
});

// Get component history
router.get('/:sessionId/history', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const history = session.getComponentHistory();

    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get component history' });
  }
});

// Restore component version
router.post('/:sessionId/restore/:version', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await session.restoreComponent(parseInt(req.params.version));

    res.json({
      message: 'Component restored successfully',
      session
    });
  } catch (error) {
    console.error('Restore component error:', error);
    res.status(500).json({ error: 'Failed to restore component' });
  }
});

// Search sessions
router.get('/search/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;
    
    const sessions = await Session.find({
      userId: req.user._id,
      isActive: true,
      $text: { $search: query }
    })
    .select('title description lastActivity createdAt')
    .sort({ score: { $meta: 'textScore' } })
    .limit(10);

    res.json({ sessions });
  } catch (error) {
    console.error('Search sessions error:', error);
    res.status(500).json({ error: 'Failed to search sessions' });
  }
});

// Duplicate session
router.post('/:sessionId/duplicate', auth, async (req, res) => {
  try {
    const originalSession = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!originalSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const newSession = new Session({
      userId: req.user._id,
      title: `${originalSession.title} (Copy)`,
      description: originalSession.description,
      messages: originalSession.messages,
      currentComponent: originalSession.currentComponent,
      componentHistory: originalSession.componentHistory,
      settings: originalSession.settings,
      tags: originalSession.tags
    });

    await newSession.save();

    res.status(201).json({
      message: 'Session duplicated successfully',
      session: newSession
    });
  } catch (error) {
    console.error('Duplicate session error:', error);
    res.status(500).json({ error: 'Failed to duplicate session' });
  }
});

module.exports = router; 