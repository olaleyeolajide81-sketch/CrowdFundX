const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  contributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  asset: {
    type: String,
    required: true,
    enum: ['XLM', 'USD', 'EUR', 'BTC', 'ETH'],
    default: 'XLM'
  },
  transactionHash: {
    type: String,
    required: true
  },
  refundClaimed: {
    type: Boolean,
    default: false
  },
  rewardTier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RewardTier'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'refunded'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
contributionSchema.index({ campaign: 1 });
contributionSchema.index({ contributor: 1 });
contributionSchema.index({ transactionHash: 1 });
contributionSchema.index({ createdAt: -1 });

// Virtual for formatted amount
contributionSchema.virtual('formattedAmount').get(function() {
  return `${this.amount} ${this.asset}`;
});

// Static methods
contributionSchema.statics.getByCampaign = function(campaignId, options = {}) {
  const { page = 1, limit = 20 } = options;
  return this.find({ campaign: campaignId })
    .populate('contributor', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

contributionSchema.statics.getByContributor = function(contributorId, options = {}) {
  const { page = 1, limit = 20 } = options;
  return this.find({ contributor: contributorId })
    .populate('campaign', 'title slug featuredImage')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

contributionSchema.statics.getTotalByCampaign = function(campaignId) {
  return this.aggregate([
    { $match: { campaign: mongoose.Types.ObjectId(campaignId) } },
    {
      $group: {
        _id: '$campaign',
        totalAmount: { $sum: '$amount' },
        totalContributions: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Contribution', contributionSchema);
