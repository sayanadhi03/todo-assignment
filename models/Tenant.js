const mongoose = require("mongoose");

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  plan: { type: String, enum: ["FREE", "PRO"], default: "FREE" },
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.Tenant || mongoose.model("Tenant", TenantSchema);
