/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

const Service = require('../models/serviceModel');
const User = require('../models/userModel');

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  db.connect();

  // wait for mongoose connection
  const mongoose = require('mongoose');
  await new Promise((res) => mongoose.connection.once('open', res));

  // Find an admin user to set as createdBy
  let admin = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
  if (!admin) admin = await User.findOne();
  if (!admin) {
    console.error('No users found in DB to set as createdBy. Please create an admin user first.');
    process.exit(1);
  }

  const mergedPath = path.join(__dirname, 'merged_services.json');
  const servicesPath = path.join(__dirname, '..', 'services.json');
  let data = null;

  if (fs.existsSync(mergedPath)) {
    data = JSON.parse(fs.readFileSync(mergedPath, 'utf8'));
    data = Array.isArray(data.services) ? data.services : data.services || [];
  } else if (fs.existsSync(servicesPath)) {
    data = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
    data = Array.isArray(data) ? data : data.services || [];
  } else {
    console.error('No services.json or merged_services.json found');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;

  for (const s of data) {
    const title = s.title || s.name || s.serviceName || s.name || '';
    if (!title) continue;
    const slug = slugify(title);

    // Determine price: assume incoming price is in rupees; store in paise
    let priceRupees = 0;
    if (typeof s.price === 'number') priceRupees = s.price;
    else if (typeof s.price === 'string') {
      const digits = s.price.replace(/[^0-9.]/g, '');
      priceRupees = digits ? Number(digits) : 0;
    } else if (typeof s.priceRupees === 'number') priceRupees = s.priceRupees;

    const pricePaise = Math.round((priceRupees || 0) * 100);

    const payload = {
      title: String(title).trim(),
      slug,
      description: s.description || s.desc || s.shortDescription || '',
      price: pricePaise,
      category: s.category || 'General Service',
      visible: s.visible !== undefined ? !!s.visible : true,
      type: s.type || (s.vehicleType ? s.vehicleType : 'car'),
      createdBy: admin._id,
    };

    try {
      // Try to find by slug or title
      let existing = null;
      if (slug) existing = await Service.findOne({ slug });
      if (!existing) existing = await Service.findOne({ title: payload.title });

      if (existing) {
        await Service.updateOne({ _id: existing._id }, { $set: payload });
        updated += 1;
      } else {
        const doc = new Service(payload);
        await doc.save();
        created += 1;
      }
    } catch (e) {
      console.error('Upsert failed for', title, e.message);
    }
  }

  console.log('Sync complete. Created:', created, 'Updated:', updated);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
