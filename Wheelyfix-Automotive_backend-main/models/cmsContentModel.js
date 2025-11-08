const mongoose = require('mongoose');

const cmsContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true }, // e.g., hero.title, homepage.banner
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CmsContent', cmsContentSchema);


