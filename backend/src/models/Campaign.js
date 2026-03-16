const mongoose = require('mongoose');

const rewardTierSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  minContribution: {
    type: Number,
    required: true,
    min: 0
  },
  maxBackers: {
    type: Number,
    required: true,
    min: 1
  },
  currentBackers: {
    type: Number,
    default: 0,
    min: 0
  },
  estimatedDelivery: {
    type: Date,
    required: true
  },
  shippingInfo: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const campaignSchema = new mongoose.Schema({
  creator: {
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
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'technology',
      'art',
      'music',
      'film',
      'publishing',
      'games',
      'food',
      'fashion',
      'community',
      'education',
      'health',
      'environment',
      'other'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  fundingGoal: {
    type: Number,
    required: true,
    min: 1
  },
  currentFunding: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'XLM',
    enum: ['XLM', 'USD', 'EUR', 'BTC', 'ETH']
  },
  deadline: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'successful', 'failed', 'cancelled', 'paused'],
    default: 'draft'
  },
  featuredImage: {
    type: String,
    default: null
  },
  images: [{
    type: String
  }],
  videoUrl: {
    type: String,
    default: null
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  rewardTiers: [rewardTierSchema],
  updates: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    images: [String],
    publishedAt: {
      type: Date,
      default: Date.now
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  }],
  faq: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  team: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    imageUrl: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      website: String
    }
  }],
  risks: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  contractAddress: {
    type: String,
    default: null
  },
  stellarContractId: {
    type: String,
    default: null
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNotes: {
    type: String,
    trim: true
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    uniqueContributors: {
      type: Number,
      default: 0
    },
    averageContribution: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
campaignSchema.virtual('progress').get(function() {
  if (this.fundingGoal === 0) return 0;
  return Math.min((this.currentFunding / this.fundingGoal) * 100, 100);
});

campaignSchema.virtual('daysLeft').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
});

campaignSchema.virtual('isFunded').get(function() {
  return this.currentFunding >= this.fundingGoal;
});

campaignSchema.virtual('isExpired').get(function() {
  return new Date() > this.deadline;
});

// Indexes for better performance
campaignSchema.index({ creator: 1 });
campaignSchema.index({ slug: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ deadline: 1 });
campaignSchema.index({ featuredImage: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ currentFunding: -1 });
campaignSchema.index({ isFeatured: 1, status: 1 });

// Pre-save middleware
campaignSchema.pre('save', function(next) {
  // Generate slug from title if not provided
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  // Update stats
  if (this.isModified('currentFunding') || this.isModified('fundingGoal')) {
    this.stats.averageContribution = this.stats.uniqueContributors > 0 
      ? this.currentFunding / this.stats.uniqueContributors 
      : 0;
  }
  
  next();
});

// Instance methods
campaignSchema.methods.addContribution = async function(amount, contributorId) {
  this.currentFunding += amount;
  
  // Update unique contributors count
  const Contribution = mongoose.model('Contribution');
  const uniqueContributors = await Contribution.distinct('contributor', {
    campaign: this._id
  });
  this.stats.uniqueContributors = uniqueContributors.length;
  
  // Check if campaign is successful
  if (this.currentFunding >= this.fundingGoal && this.status === 'active') {
    this.status = 'successful';
  }
  
  await this.save();
};

campaignSchema.methods.addUpdate = async function(updateData) {
  this.updates.push(updateData);
  return this.save();
};

campaignSchema.methods.incrementViews = async function() {
  this.stats.views += 1;
  return this.save();
};

// Static methods
campaignSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug, isActive: true })
    .populate('creator', 'username firstName lastName avatar isVerified')
    .populate('updates.author', 'username firstName lastName avatar');
};

campaignSchema.statics.findActive = function(filter = {}) {
  return this.find({
    status: 'active',
    deadline: { $gt: new Date() },
    isActive: true,
    moderationStatus: 'approved',
    ...filter
  })
    .populate('creator', 'username firstName lastName avatar isVerified')
    .sort({ createdAt: -1 });
};

campaignSchema.statics.findFeatured = function(limit = 10) {
  return this.find({
    isFeatured: true,
    status: 'active',
    deadline: { $gt: new Date() },
    isActive: true,
    moderationStatus: 'approved'
  })
    .populate('creator', 'username firstName lastName avatar isVerified')
    .sort({ createdAt: -1 })
    .limit(limit);
};

campaignSchema.statics.search = function(query, options = {}) {
  const {
    category,
    status = 'active',
    sortBy = 'createdAt',
    sortOrder = -1,
    limit = 20,
    skip = 0,
    minGoal,
    maxGoal
  } = options;

  const searchQuery = {
    status,
    isActive: true,
    moderationStatus: 'approved',
    deadline: { $gt: new Date() }
  };

  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  if (category) {
    searchQuery.category = category;
  }

  if (minGoal || maxGoal) {
    searchQuery.fundingGoal = {};
    if (minGoal) searchQuery.fundingGoal.$gte = minGoal;
    if (maxGoal) searchQuery.fundingGoal.$lte = maxGoal;
  }

  const sort = {};
  sort[sortBy] = sortOrder;

  return this.find(searchQuery)
    .populate('creator', 'username firstName lastName avatar isVerified')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Campaign', campaignSchema);
