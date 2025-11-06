var express = require('express');
var router = express.Router();
var db = require.main.require ('./models/db_controller');
var async = require('async');

// Middleware to check if user is an Admin
router.use('/', function(req, res, next) {
    if (req.session.loggedin && req.session.role === 'admin') {
        next();
    } else {
        res.status(403).send('Access Denied: You must be an Admin to view this page.');
    }
});

// GET /admin/dashboard
router.get('/dashboard', function(req, res) {
    
    // We now call ALL database functions, including the new ones
    async.parallel({
        // Original calls
        patientCount: cb => db.getPatientCount(cb),
        doctorCount: cb => db.getDoctorCount(cb),
        totalRevenue: cb => db.getTotalRevenue(cb),
        apptCounts: cb => db.getAppointmentCounts(cb),
        patients: cb => db.getAllPatientsAdmin(cb),
        doctorsForTable: cb => db.getAllDoctorsAdmin(cb), // Renamed for clarity
        revenuePerDoctorChart: cb => db.getRevenuePerDoctor(cb), // Renamed for clarity
        
        // --- NEW DATA CALLS ---
        revenueLastMonth: cb => db.getRevenueLastMonth(cb),
        revenuePreviousMonth: cb => db.getRevenuePreviousMonth(cb),
        appointmentsLast30Days: cb => db.getAppointmentsLast30Days(cb),
        newPatientsThisMonth: cb => db.getNewPatientsThisMonth(cb),
        departmentPerformance: cb => db.getDepartmentPerformance(cb),
        monthlyRevenueTrend: cb => db.getMonthlyRevenueTrend(cb),
        appointmentsTrend: cb => db.getAppointmentsTrend(cb),
        topDoctors: cb => db.getTopDoctorsLeaderboard(cb) // For the leaderboard

    }, function(err, results) {
        if (err) {
            console.log(err);
            return res.send('Error loading dashboard data.');
        }

        // --- Process ANALYTICS data ---

        // Helper function to safely get results
        const getVal = (data, key) => (data && data[0] && data[0][0]) ? data[0][0][key] : 0;
        
        // Process appointment counts
        let pending = 0, confirmed = 0, rejected = 0;
        if (results.apptCounts && results.apptCounts[0]) {
            results.apptCounts[0].forEach(row => {
                if (row.status === 'Pending') pending = row.count;
                if (row.status === 'Confirmed') confirmed = row.count;
                if (row.status === 'Rejected') rejected = row.count;
            });
        }

        // Process revenue growth
        const revLastMonth = getVal(results.revenueLastMonth, 'total') || 0;
        const revPrevMonth = getVal(results.revenuePreviousMonth, 'total') || 0;
        let revenueGrowth = 0;
        if (revPrevMonth > 0) {
            revenueGrowth = (((revLastMonth - revPrevMonth) / revPrevMonth) * 100).toFixed(0);
        } else if (revLastMonth > 0) {
            revenueGrowth = 100; // Infinite growth if previous was 0
        }

        const analytics = {
            revenue: Number(getVal(results.totalRevenue, 'total')) || 0,
            patients: getVal(results.patientCount, 'count'),
            doctors: getVal(results.doctorCount, 'count'),
            pending: pending,
            confirmed: confirmed,
            rejected: rejected,
            // New analytics
            revenueLastMonth: Number(revLastMonth),
            revenueGrowth: revenueGrowth,
            appointmentsLastMonth: getVal(results.appointmentsLast30Days, 'count'),
            newPatientsThisMonth: getVal(results.newPatientsThisMonth, 'count'),
            
            // --- THIS IS THE FIX ---
            // We map the results and use parseFloat() to convert strings to numbers.
            departments: (results.departmentPerformance && results.departmentPerformance[0])
                ? results.departmentPerformance[0].map(dep => ({
                    ...dep,
                    revenue: parseFloat(dep.revenue) || 0, // Convert revenue string to number
                    appointments: parseInt(dep.appointments, 10) || 0 // Convert count string to number
                  }))
                : []
            // --- END FIX ---
        };

        // --- Process CHART data ---

        // Process monthly revenue into a full 12-month array
        const monthlyRevenue = new Array(12).fill(0);
        if (results.monthlyRevenueTrend && results.monthlyRevenueTrend[0]) {
            results.monthlyRevenueTrend[0].forEach(row => {
                monthlyRevenue[row.month_num - 1] = parseFloat(row.revenue); // month_num is 1-12
            });
        }
        
        const chartData = {
            appointmentStatus: {
                pending: analytics.pending,
                confirmed: analytics.confirmed,
                rejected: analytics.rejected
            },
            doctorRevenue: (results.revenuePerDoctorChart && results.revenuePerDoctorChart[0]) ? results.revenuePerDoctorChart[0] : [],
            monthlyRevenue: monthlyRevenue,
            appointmentsTrend: (results.appointmentsTrend && results.appointmentsTrend[0]) ? results.appointmentsTrend[0].map(d => d.count) : []
        };

        // --- Process DOCTOR data ---
        // The EJS file uses ONE 'doctors' array for two tables.
        // We must merge data from 'topDoctors' into 'doctorsForTable'.
        
        const doctorsList = (results.doctorsForTable && results.doctorsForTable[0]) ? results.doctorsForTable[0] : [];
        const topDoctorsData = (results.topDoctors && results.topDoctors[0]) ? results.topDoctors[0] : [];
        
        // Create a map of revenue, patientsSeen, etc., from the leaderboard query
        const topDoctorMap = new Map();
        topDoctorsData.forEach(doc => {
            topDoctorMap.set(doc.username, {
                totalRevenue: parseFloat(doc.totalRevenue),
                patientsSeen: parseInt(doc.patientsSeen, 10),
                rating: doc.rating
            });
        });

        // Merge this data into the main doctors list
        const combinedDoctors = doctorsList.map(doc => {
            const extraData = topDoctorMap.get(doc.username);
            return {
                ...doc,
                totalRevenue: extraData ? extraData.totalRevenue : 0,
                patientsSeen: extraData ? extraData.patientsSeen : 0,
                rating: extraData ? extraData.rating : 'N/A' // Default rating
            };
        });

        // --- Render the dashboard ---
        res.render('admin_dashboard.ejs', {
            username: req.session.username,
            analytics: analytics,
            patients: (results.patients && results.patients[0]) ? results.patients[0] : [],
            doctors: combinedDoctors, // Pass the new combined array
            chartData: chartData
        });
    });
});

module.exports = router;