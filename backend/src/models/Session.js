const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const componentSchema = new mongoose.Schema({
  jsx: {
    type: String,
    default: ''
  },
  css: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  version: {
    type: Number,
    default: 1
  }
});

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  messages: [messageSchema],
  currentComponent: componentSchema,
  componentHistory: [componentSchema],
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    autoSaveInterval: {
      type: Number,
      default: 30000 // 30 seconds
    }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient queries
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, lastActivity: -1 });
sessionSchema.index({ title: 'text', description: 'text' });

// Update lastActivity on save
sessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Virtual for message count
sessionSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Virtual for component version
sessionSchema.virtual('currentVersion').get(function() {
  return this.currentComponent.version;
});

// Method to add message
sessionSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    metadata,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update component
sessionSchema.methods.updateComponent = function(jsx, css, metadata = {}) {
  // Add current component to history
  if (this.currentComponent.jsx || this.currentComponent.css) {
    this.componentHistory.push({
      ...this.currentComponent.toObject(),
      timestamp: new Date()
    });
  }
  
  // Update current component
  this.currentComponent = {
    jsx,
    css,
    metadata,
    version: this.currentComponent.version + 1
  };
  
  return this.save();
};

// Method to get component history
sessionSchema.methods.getComponentHistory = function() {
  return this.componentHistory.sort((a, b) => b.timestamp - a.timestamp);
};

// Method to restore component version
sessionSchema.methods.restoreComponent = function(version) {
  const historyItem = this.componentHistory.find(item => item.version === version);
  if (historyItem) {
    this.currentComponent = { ...historyItem };
    return this.save();
  }
  throw new Error('Component version not found');
};

module.exports = mongoose.model('Session', sessionSchema); 