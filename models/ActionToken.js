const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { Schema } = mongoose;

const tokenSchema = new Schema({
  _id: { type: String, default: uuidv4 }, 
  entity_id: { type: String, required: true },
  action_name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true },
  executed_at: { type: Date },
});

// Add an index on the `expires_at` field for efficient querying
// Also, add a TTL index to automatically remove expired tokens
tokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
