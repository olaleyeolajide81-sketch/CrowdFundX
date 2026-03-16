const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  stellarAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  kycDocuments: [{
    type: String, // IPFS hashes
    required: false
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  stats: {
    campaignsCreated: {
      type: Number,
      default: 0
    },
    contributionsMade: {
      type: Number,
      default: 0
    },
    totalContributed: {
      type: Number,
      default: 0
    },
    totalRaised: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for faster queries
userSchema.index({ stellarAddress: 1 });
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ kycStatus: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware for password hashing (if password field is added)
userSchema.pre('save', async function(next) {
  // This is a placeholder for future password functionality
  // if (this.isModified('password')) {
  //   const salt = await bcrypt.genSalt(12);
  //   this.password = await bcrypt.hash(this.password, salt);
  // }
  next();
});

// Instance methods
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.__v;
  return userObject;
};

userSchema.methods.updateStats = async function(type, amount = 0) {
  if (type === 'campaign_created') {
    this.stats.campaignsCreated += 1;
  } else if (type === 'contribution_made') {
    this.stats.contributionsMade += 1;
    this.stats.totalContributed += amount;
  } else if (type === 'funds_raised') {
    this.stats.totalRaised += amount;
  }
  
  await this.save();
};

// Static methods
userSchema.statics.findByStellarAddress = function(stellarAddress) {
  return this.findOne({ stellarAddress: stellarAddress.toLowerCase() });
};

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.isEmailTaken = async function(email, excludeUserId) {
  const query = { email: email.toLowerCase() };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  const user = await this.findOne(query);
  return !!user;
};

userSchema.statics.isUsernameTaken = async function(username, excludeUserId) {
  const query = { username: username.toLowerCase() };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  const user = await this.findOne(query);
  return !!user;
};

module.exports = mongoose.model('User', userSchema);
