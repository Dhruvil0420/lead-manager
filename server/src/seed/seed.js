const path = require('path');
const dotenv = require('dotenv');

// Load .env from server directory or current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const mongoose = require('mongoose');
const User = require('../models/User');
const { Lead } = require('../models/Lead');

const DEMO_CONFIG = {
  name: 'Demo User',
  email: 'lead@30gmail.com',
  password: 'Lead123',
};

// Hardcoded First Names (Indian & International)
const FIRST_NAMES = [
  // Indian
  'Aarav', 'Priya', 'Rohan', 'Sneha', 'Vikram', 'Ananya', 'Aditya', 'Neha',
  'Arjun', 'Kavita', 'Suresh', 'Meera', 'Rajesh', 'Deepa', 'Kunal', 'Sunita',
  'Sanjay', 'Ritu', 'Manish', 'Pooja', 'Amit', 'Swati', 'Harsh', 'Tanvi', 'Varun',
  // International
  'Alex', 'Sarah', 'Michael', 'Emma', 'David', 'Jessica', 'Daniel', 'Emily',
  'James', 'Sophia', 'Robert', 'Olivia', 'William', 'Ava', 'Lucas', 'Elena',
  'Carlos', 'Fatima', 'Kenji', 'Chloe', 'Noah', 'Mia', 'Ethan', 'Isabella', 'Liam'
];

// Hardcoded Last Names (Indian & International)
const LAST_NAMES = [
  // Indian
  'Sharma', 'Patel', 'Verma', 'Singh', 'Iyer', 'Gupta', 'Nair', 'Joshi',
  'Reddy', 'Mehta', 'Chopra', 'Bose', 'Chatterjee', 'Kulkarni', 'Deshmukh',
  // International
  'Smith', 'Johnson', 'Williams', 'Brown', 'Garcia', 'Miller', 'Davis',
  'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'
];

// Hardcoded Realistic Companies & Domains
const COMPANIES = [
  { name: 'Tata Consultancy Services', domain: 'tcs.com', isIndian: true },
  { name: 'Infosys Technologies', domain: 'infosys.com', isIndian: true },
  { name: 'Reliance Digital', domain: 'reliancedigital.in', isIndian: true },
  { name: 'Wipro Enterprises', domain: 'wipro.com', isIndian: true },
  { name: 'HDFC Bank', domain: 'hdfcbank.com', isIndian: true },
  { name: 'Bharti Airtel', domain: 'airtel.in', isIndian: true },
  { name: 'Tech Mahindra', domain: 'techmahindra.com', isIndian: true },
  { name: 'Larsen & Toubro', domain: 'lntinfotech.com', isIndian: true },
  { name: 'Zomato Media', domain: 'zomato.com', isIndian: true },
  { name: 'Flipkart Internet', domain: 'flipkart.com', isIndian: true },
  { name: 'Acme Corporation', domain: 'acmecorp.com', isIndian: false },
  { name: 'Cyberdyne Systems', domain: 'cyberdyne.io', isIndian: false },
  { name: 'Stark Industries', domain: 'starkindustries.com', isIndian: false },
  { name: 'Wayne Enterprises', domain: 'wayneenterprises.com', isIndian: false },
  { name: 'Initech Solutions', domain: 'initech.com', isIndian: false },
  { name: 'Umbrella Corporation', domain: 'umbrellacorp.com', isIndian: false },
  { name: 'Globex Corporation', domain: 'globex.com', isIndian: false },
  { name: 'Massive Dynamic', domain: 'massivedynamic.com', isIndian: false },
  { name: 'Pied Piper', domain: 'piedpiper.com', isIndian: false },
  { name: 'Hooli Technologies', domain: 'hooli.xyz', isIndian: false },
  { name: 'Dunder Mifflin Paper', domain: 'dundermifflin.com', isIndian: false },
  { name: 'Aperture Science', domain: 'aperturescience.com', isIndian: false },
];

// Fisher-Yates shuffle utility
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate phone number passing /^\+?[0-9\s\-()]{7,20}$/
function generatePhoneNumber(isIndian, index) {
  if (isIndian) {
    const prefixes = ['98', '97', '99', '91', '88', '70'];
    const prefix = prefixes[index % prefixes.length];
    const randNum = String(10000000 + Math.floor(Math.random() * 89999999)).slice(2);
    return `+91 ${prefix}${randNum}`;
  } else {
    const areaCodes = ['415', '212', '312', '512', '206', '617'];
    const area = areaCodes[index % areaCodes.length];
    const middle = String(200 + (index * 7) % 700);
    const line = String(1000 + (index * 13) % 8999);
    return `+1 (${area}) ${middle}-${line}`;
  }
}

async function seedDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lead_manager';

  console.log('========================================');
  console.log('       LEAD MANAGER SEED SCRIPT         ');
  console.log('========================================');
  console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:[^:@]+@/, ':****@')}...`);

  await mongoose.connect(mongoUri);
  console.log('✓ Successfully connected to MongoDB');

  // 1. Create or reuse demo user
  let demoUser = await User.findOne({ email: DEMO_CONFIG.email });
  let userStatusText = '';

  if (!demoUser) {
    demoUser = await User.create({
      name: DEMO_CONFIG.name,
      email: DEMO_CONFIG.email,
      password: DEMO_CONFIG.password,
    });
    userStatusText = 'Created fresh demo user';
  } else {
    demoUser.name = DEMO_CONFIG.name;
    demoUser.password = DEMO_CONFIG.password;
    await demoUser.save();
    userStatusText = 'Reused existing demo user (synchronized credentials)';
  }

  console.log(`✓ Demo User: ${demoUser.email} (${userStatusText})`);
  console.log(`  User ID: ${demoUser._id}`);

  // 2. Idempotently clear ONLY this user's leads
  const deleteResult = await Lead.deleteMany({ user: demoUser._id });
  console.log(`✓ Cleared ${deleteResult.deletedCount} existing leads for this demo user (idempotent run)`);

  // 3. Prepare 60 distributed statuses:
  // Roughly: New 35% (21), Contacted 25% (15), Qualified 25% (15), Lost 15% (9)
  const statusPool = [
    ...Array(21).fill('New'),
    ...Array(15).fill('Contacted'),
    ...Array(15).fill('Qualified'),
    ...Array(9).fill('Lost'),
  ];
  const shuffledStatuses = shuffleArray(statusPool);

  // 4. Prepare 60 evenly distributed sources (10 for each of the 6 sources):
  // Website, Referral, LinkedIn, Cold Call, Event, Other
  const sourcePool = [
    ...Array(10).fill('Website'),
    ...Array(10).fill('Referral'),
    ...Array(10).fill('LinkedIn'),
    ...Array(10).fill('Cold Call'),
    ...Array(10).fill('Event'),
    ...Array(10).fill('Other'),
  ];
  const shuffledSources = shuffleArray(sourcePool);

  // 5. Generate 60 unique leads with dates across the last 90 days
  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const usedEmails = new Set();
  const leadsToInsert = [];

  for (let i = 0; i < 60; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 3 + Math.floor(i / FIRST_NAMES.length)) % LAST_NAMES.length];
    const company = COMPANIES[i % COMPANIES.length];
    const fullName = `${firstName} ${lastName}`;

    // Unique email in name@company.com style
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.domain}`;
    if (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i + 1}@${company.domain}`;
    }
    usedEmails.add(email);

    // Phone number compliant with /^\+?[0-9\s\-()]{7,20}$/
    const phone = generatePhoneNumber(company.isIndian, i);

    // Spread createdAt randomly across the past 90 days
    const randomOffsetMs = Math.floor(Math.random() * ninetyDaysMs);
    const createdAt = new Date(now - randomOffsetMs);
    const remainingTime = now - createdAt.getTime();
    const updatedAt = new Date(createdAt.getTime() + Math.floor(Math.random() * remainingTime));

    leadsToInsert.push({
      name: fullName,
      email,
      phone,
      company: company.name,
      source: shuffledSources[i],
      status: shuffledStatuses[i],
      user: demoUser._id,
      createdAt,
      updatedAt,
    });
  }

  // 6. Bulk insert all leads
  const insertedLeads = await Lead.insertMany(leadsToInsert);

  // 7. Calculate and log summary
  const statusCounts = insertedLeads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const sourceCounts = insertedLeads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});

  console.log('\n========================================');
  console.log('          SEED SUMMARY REPORT           ');
  console.log('========================================');
  console.log(`Demo Account:    ${demoUser.email}`);
  console.log(`Password:        ${DEMO_CONFIG.password}`);
  console.log(`Total Leads:     ${insertedLeads.length}`);
  console.log('----------------------------------------');
  console.log('Status Breakdown:');
  console.log(`  - New:         ${statusCounts['New'] || 0} (${((statusCounts['New'] / 60) * 100).toFixed(1)}%)`);
  console.log(`  - Contacted:   ${statusCounts['Contacted'] || 0} (${((statusCounts['Contacted'] / 60) * 100).toFixed(1)}%)`);
  console.log(`  - Qualified:   ${statusCounts['Qualified'] || 0} (${((statusCounts['Qualified'] / 60) * 100).toFixed(1)}%)`);
  console.log(`  - Lost:        ${statusCounts['Lost'] || 0} (${((statusCounts['Lost'] / 60) * 100).toFixed(1)}%)`);
  console.log('----------------------------------------');
  console.log('Source Breakdown (Evenly Distributed):');
  Object.entries(sourceCounts).forEach(([source, count]) => {
    console.log(`  - ${source.padEnd(12)}: ${count}`);
  });
  console.log('========================================');
  console.log('✓ Seeding completed successfully!\n');
}

async function run() {
  try {
    await seedDatabase();
    process.exitCode = 0;
  } catch (error) {
    console.error('\n❌ Seeding failed with error:', error);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
      console.log('✓ MongoDB connection closed');
    } catch (disconnectErr) {
      console.error('Error closing MongoDB connection:', disconnectErr);
    }
    process.exit(process.exitCode || 0);
  }
}

run();
