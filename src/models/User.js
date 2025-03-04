const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  residentNumber: {
    type: String,
    required: true
  },
  gender: String,
  personality: String,
  stress: String,
  workIntensity: String,
  height: Number,
  weight: Number,
  bmi: Number,
  pulse: Number,
  systolicBP: Number,
  diastolicBP: Number,
  ab_ms: Number,
  ac_ms: Number,
  ad_ms: Number,
  ae_ms: Number,
  ba_ratio: Number,
  ca_ratio: Number,
  da_ratio: Number,
  ea_ratio: Number,
  pvc: Number,
  bv: Number,
  sv: Number,
  hr: Number,
  symptoms: [String],
  medication: String,
  preference: String,
  memo: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // 스키마에 정의되지 않은 필드도 허용
  strict: false
});

module.exports = mongoose.model('User', userSchema); 