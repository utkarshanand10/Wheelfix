const mongoose = require("mongoose");

const pricingRuleSchema = new mongoose.Schema(
  {
    // scope identifies what the refId refers to. We extend with 'vehicleService' for brand+model+fuel+serviceName overrides.
    scope: {
      type: String,
      enum: ["service", "brand", "model", "vehicleService"],
      required: true,
      index: true,
    },
    // refId meaning depends on scope:
    //  service: serviceId
    //  brand: brandSlug
    //  model: `${brandSlug}:${modelName}`
    //  vehicleService: `${brand}|${model}|${fuel}|${serviceName}` (raw names as used in services.json)
    refId: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PricingRule", pricingRuleSchema);
