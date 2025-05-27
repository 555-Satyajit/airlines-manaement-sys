// controllers/adminController.js
const User = require('../models/User');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const Aircraft = require('../models/Aircraft');
const Airport = require('../models/Airport');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalFlights = await Flight.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalAircraft = await Aircraft.countDocuments();
    const totalAirports = await Airport.countDocuments();

    // Get recent bookings
    const recentBookings = await Booking.find({})
      .populate('user', 'firstName lastName')
      .populate('flight', 'flightNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get revenue statistics
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Get monthly revenue
    const monthlyRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Get flight status distribution
    const flightStatusDistribution = await Flight.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get popular routes
    const popularRoutes = await Booking.aggregate([
      {
        $lookup: {
          from: 'flights',
          localField: 'flight',
          foreignField: '_id',
          as: 'flightInfo'
        }
      },
      { $unwind: '$flightInfo' },
      {
        $lookup: {
          from: 'airports',
          localField: 'flightInfo.origin',
          foreignField: '_id',
          as: 'originInfo'
        }
      },
      {
        $lookup: {
          from: 'airports',
          localField: 'flightInfo.destination',
          foreignField: '_id',
          as: 'destinationInfo'
        }
      },
      { $unwind: '$originInfo' },
      { $unwind: '$destinationInfo' },
      {
        $group: {
          _id: {
            origin: '$originInfo.code',
            destination: '$destinationInfo.code',
            originName: '$originInfo.name',
            destinationName: '$destinationInfo.name'
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalFlights,
        totalBookings,
        totalAircraft,
        totalAirports,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentBookings,
      monthlyRevenue,
      flightStatusDistribution,
      popularRoutes
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get revenue report
// @route   GET /api/admin/reports/revenue
// @access  Private/Admin
const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    let matchStage = { paymentStatus: 'paid' };
    
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let groupStage;
    if (groupBy === 'day') {
      groupStage = {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        }
      };
    } else if (groupBy === 'week') {
      groupStage = {
        _id: {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        }
      };
    } else {
      groupStage = {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        }
      };
    }

    const revenue = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          ...groupStage,
          totalRevenue: { $sum: '$totalAmount' },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    res.json(revenue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get booking report
// @route   GET /api/admin/reports/bookings
// @access  Private/Admin
const getBookingReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Booking status distribution
    const statusDistribution = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Payment status distribution
    const paymentDistribution = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Class preference distribution
    const classDistribution = await Booking.aggregate([
      { $match: matchStage },
      { $unwind: '$passengers' },
      {
        $group: {
          _id: '$passengers.seatClass',
          count: { $sum: 1 }
        }
      }
    ]);

    // Cancellation analysis
    const cancellationAnalysis = await Booking.aggregate([
      { 
        $match: { 
          ...matchStage,
          bookingStatus: 'cancelled' 
        } 
      },
      {
        $group: {
          _id: '$cancellationReason',
          count: { $sum: 1 },
          totalRefunded: { $sum: '$refundAmount' }
        }
      }
    ]);

    res.json({
      statusDistribution,
      paymentDistribution,
      classDistribution,
      cancellationAnalysis
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get flight report
// @route   GET /api/admin/reports/flights
// @access  Private/Admin
const getFlightReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    
    if (startDate && endDate) {
      matchStage.departureTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Flight utilization
    const flightUtilization = await Flight.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'aircraft',
          localField: 'aircraft',
          foreignField: '_id',
          as: 'aircraftInfo'
        }
      },
      { $unwind: '$aircraftInfo' },
      {
        $addFields: {
          totalCapacity: {
            $add: [
              '$aircraftInfo.capacity.economy',
              '$aircraftInfo.capacity.business',
              '$aircraftInfo.capacity.first'
            ]
          },
          totalAvailable: {
            $add: [
              '$availableSeats.economy',
              '$availableSeats.business',
              '$availableSeats.first'
            ]
          }
        }
      },
      {
        $addFields: {
          occupiedSeats: { $subtract: ['$totalCapacity', '$totalAvailable'] },
          utilizationRate: {
            $multiply: [
              { $divide: [{ $subtract: ['$totalCapacity', '$totalAvailable'] }, '$totalCapacity'] },
              100
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageUtilization: { $avg: '$utilizationRate' },
          totalFlights: { $sum: 1 },
          totalSeatsOffered: { $sum: '$totalCapacity' },
          totalSeatsOccupied: { $sum: '$occupiedSeats' }
        }
      }
    ]);

    // On-time performance
    const onTimePerformance = await Flight.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Route performance
    const routePerformance = await Flight.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'airports',
          localField: 'origin',
          foreignField: '_id',
          as: 'originInfo'
        }
      },
      {
        $lookup: {
          from: 'airports',
          localField: 'destination',
          foreignField: '_id',
          as: 'destinationInfo'
        }
      },
      { $unwind: '$originInfo' },
      { $unwind: '$destinationInfo' },
      {
        $group: {
          _id: {
            route: {
              $concat: ['$originInfo.code', '-', '$destinationInfo.code']
            }
          },
          totalFlights: { $sum: 1 },
          onTimeFlights: {
            $sum: { $cond: [{ $eq: ['$status', 'arrived'] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          onTimePercentage: {
            $multiply: [
              { $divide: ['$onTimeFlights', '$totalFlights'] },
              100
            ]
          }
        }
      },
      { $sort: { totalFlights: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      flightUtilization: flightUtilization[0] || {},
      onTimePerformance,
      routePerformance
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user report
// @route   GET /api/admin/reports/users
// @access  Private/Admin
const getUserReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // User registration trends
    const registrationTrends = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // User demographics
    const demographics = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$nationality',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Active vs inactive users
    const userActivity = await User.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top customers by bookings
    const topCustomers = await Booking.aggregate([
      {
        $group: {
          _id: '$user',
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userName: {
            $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName']
          },
          email: '$userInfo.email',
          totalBookings: 1,
          totalSpent: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      registrationTrends,
      demographics,
      userActivity,
      topCustomers
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Export data
// @route   GET /api/admin/export/:type
// @access  Private/Admin
const exportData = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, format = 'json' } = req.query;

    let data;
    let filename;

    switch (type) {
      case 'bookings':
        const bookingQuery = {};
        if (startDate && endDate) {
          bookingQuery.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
        
        data = await Booking.find(bookingQuery)
          .populate('user', 'firstName lastName email')
          .populate({
            path: 'flight',
            populate: {
              path: 'origin destination',
              select: 'code name city'
            }
          })
          .lean();
        
        filename = `bookings_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'flights':
        const flightQuery = {};
        if (startDate && endDate) {
          flightQuery.departureTime = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
        
        data = await Flight.find(flightQuery)
          .populate('origin destination aircraft')
          .lean();
        
        filename = `flights_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'users':
        const userQuery = {};
        if (startDate && endDate) {
          userQuery.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
        
        data = await User.find(userQuery)
          .select('-password -resetPasswordToken')
          .lean();
        
        filename = `users_export_${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      let csv = '';
      if (data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        csv += headers + '\n';
        
        data.forEach(row => {
          const values = Object.values(row).map(value => 
            typeof value === 'object' && value !== null 
              ? JSON.stringify(value).replace(/"/g, '""') 
              : value
          ).join(',');
          csv += values + '\n';
        });
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json(data);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueReport,
  getBookingReport,
  getFlightReport,
  getUserReport,
  exportData
};
