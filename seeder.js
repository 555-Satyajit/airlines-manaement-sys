// seeder.js - Database seeder for initial data
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Airport = require('./models/Airport');
const Aircraft = require('./models/Aircraft');
const Flight = require('./models/Flight');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skyline-airlines');
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Sample data
const airports = [
  {
    code: 'JFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 40.6413, longitude: -73.7781 }
  },
  {
    code: 'LAX',
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 33.9425, longitude: -118.4081 }
  },
  {
    code: 'LHR',
    name: 'London Heathrow Airport',
    city: 'London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    coordinates: { latitude: 51.4700, longitude: -0.4543 }
  },
  {
    code: 'CDG',
    name: 'Charles de Gaulle Airport',
    city: 'Paris',
    country: 'France',
    timezone: 'Europe/Paris',
    coordinates: { latitude: 49.0097, longitude: 2.5479 }
  },
  {
    code: 'NRT',
    name: 'Narita International Airport',
    city: 'Tokyo',
    country: 'Japan',
    timezone: 'Asia/Tokyo',
    coordinates: { latitude: 35.7647, longitude: 140.3864 }
  }
];

const aircraft = [
  {
    registration: 'N123SL',
    model: 'Boeing 737-800',
    manufacturer: 'Boeing',
    capacity: { economy: 160, business: 16, first: 0 },
    yearManufactured: 2018,
    fuelCapacity: 26020,
    range: 5765,
    cruisingSpeed: 840
  },
  {
    registration: 'N456SL',
    model: 'Airbus A320',
    manufacturer: 'Airbus',
    capacity: { economy: 150, business: 12, first: 0 },
    yearManufactured: 2019,
    fuelCapacity: 24210,
    range: 6150,
    cruisingSpeed: 830
  },
  {
    registration: 'N789SL',
    model: 'Boeing 777-300ER',
    manufacturer: 'Boeing',
    capacity: { economy: 296, business: 42, first: 8 },
    yearManufactured: 2020,
    fuelCapacity: 181280,
    range: 13649,
    cruisingSpeed: 905
  }
];

const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@skylineairlines.com',
    password: 'password123',
    role: 'admin',
    phone: '+1-555-0001'
  },
  {
    firstName: 'Staff',
    lastName: 'User',
    email: 'staff@skylineairlines.com',
    password: 'password123',
    role: 'staff',
    phone: '+1-555-0002'
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'passenger',
    phone: '+1-555-0003',
    nationality: 'United States'
  }
];

// Seeder functions
const seedAirports = async () => {
  try {
    await Airport.deleteMany({});
    await Airport.insertMany(airports);
    console.log('✅ Airports seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding airports:', error);
  }
};

const seedAircraft = async () => {
  try {
    await Aircraft.deleteMany({});
    await Aircraft.insertMany(aircraft);
    console.log('✅ Aircraft seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding aircraft:', error);
  }
};

const seedUsers = async () => {
  try {
    await User.deleteMany({});
    
    // Hash passwords before saving
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );
    
    await User.insertMany(hashedUsers);
    console.log('✅ Users seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

const seedFlights = async () => {
  try {
    await Flight.deleteMany({});
    
    // Get airport and aircraft IDs
    const airportData = await Airport.find({});
    const aircraftData = await Aircraft.find({});
    
    const sampleFlights = [
      {
        flightNumber: 'SL001',
        origin: airportData.find(a => a.code === 'JFK')._id,
        destination: airportData.find(a => a.code === 'LAX')._id,
        aircraft: aircraftData[0]._id,
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        arrivalTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 hours later
        duration: 360,
        price: { economy: 299, business: 599, first: 0 },
        availableSeats: { economy: 160, business: 16, first: 0 }
      },
      {
        flightNumber: 'SL002',
        origin: airportData.find(a => a.code === 'LAX')._id,
        destination: airportData.find(a => a.code === 'JFK')._id,
        aircraft: aircraftData[1]._id,
        departureTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 25 * 60 * 60 * 1000 + 5.5 * 60 * 60 * 1000),
        duration: 330,
        price: { economy: 299, business: 599, first: 0 },
        availableSeats: { economy: 150, business: 12, first: 0 }
      }
    ];
    
    await Flight.insertMany(sampleFlights);
    console.log('✅ Flights seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding flights:', error);
  }
};

// Main seeder function
const seedAll = async () => {
  await connectDB();
  
  console.log('🌱 Starting database seeding...');
  
  await seedAirports();
  await seedAircraft();
  await seedUsers();
  await seedFlights();
  
  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Default Login Credentials:');
  console.log('Admin: admin@skylineairlines.com / password123');
  console.log('Staff: staff@skylineairlines.com / password123');
  console.log('User: john.doe@example.com / password123');
  
  process.exit(0);
};

// Run seeder if called directly
if (require.main === module) {
  seedAll();
}

module.exports = { seedAll };
        