const mysql = require('mysql2');

// --- THIS IS THE FIX ---
// We are changing from a single 'createConnection' to a 'createPool'
// A pool is more stable and manages connections automatically.

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'BUbu00*#',
  database: 'nodelogin',
  waitForConnections: true,
  connectionLimit: 10, // You can adjust this
  queueLimit: 0
});

// We can test the pool connection once
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL Connection Pool Failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL Database (via Pool)');
    connection.release(); // Release the test connection back to the pool
  }
});

// -----------------------------
// 🧠 USERS
// -----------------------------

// We now use 'pool.query' instead of 'con.query'
module.exports.signup = (username, email, hash, status, callback) => {
  const query = "INSERT INTO users (username, email, password, email_status) VALUES (?, ?, ?, ?)";
  pool.query(query, [username, email, hash, status], callback);
};

module.exports.findOne = (email, callback) => {
  const query = "SELECT * FROM users WHERE email = ?";
  pool.query(query, [email], callback);
};

module.exports.getuserdetails = (username, callback) => {
  const query = "SELECT * FROM users WHERE username = ?";
  pool.query(query, [username], callback);
};

module.exports.edit_profile = (id, username, email, password, callback) => {
  const query = "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?";
  pool.query(query, [username, email, password, id], callback);
};

// -----------------------------
// 🧠 EMAIL VERIFICATION
// -----------------------------

module.exports.getuserid = (email, callback) => {
  const query = "SELECT * FROM verify WHERE email = ?";
  pool.query(query, [email], callback);
};

module.exports.verify = (username, email, token, callback) => {
  const query = "INSERT INTO verify (username, email, token) VALUES (?, ?, ?)";
  pool.query(query, [username, email, token], callback);
};

module.exports.matchtoken = (id, token, callback) => {
  const query = "SELECT * FROM verify WHERE token = ? AND id = ?";
  pool.query(query, [token, id], callback);
};

module.exports.updateverify = (email, email_status, callback) => {
  const query = "UPDATE users SET email_status = ? WHERE email = ?";
  pool.query(query, [email_status, email], callback);
};

// -----------------------------
// 🧠 PASSWORD RESET
// -----------------------------

module.exports.temp = (id, email, token, callback) => {
  const query = "INSERT INTO temp (id, email, token) VALUES (?, ?, ?)";
  pool.query(query, [id, email, token], callback);
};

module.exports.checktoken = (token, callback) => {
  const query = "SELECT * FROM temp WHERE token = ?";
  pool.query(query, [token], callback);
};

module.exports.setpassword = (id, newpassword, callback) => {
  const query = "UPDATE users SET password = ? WHERE id = ?";
  pool.query(query, [newpassword, id], callback);
};

// -----------------------------
// 🧠 DOCTOR (Your original functions)
// -----------------------------

module.exports.add_doctor = (first_name, last_name, email, dob, gender, address, phone, image, department, biography, callback) => {
  const query = "INSERT INTO doctor (first_name, last_name, email, dob, gender, address, phone, image, department, biography) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  pool.query(query, [first_name, last_name, email, dob, gender, address, phone, image, department, biography], callback);
};

module.exports.getAllDoc = (callback) => {
  pool.query('SELECT * FROM doctor', callback);
};

module.exports.getDocbyId = (id, callback) => {
  pool.query("SELECT * FROM doctor WHERE id = ?", [id], callback);
};

module.exports.editDoc = (id, first_name, last_name, email, dob, gender, address, phone, image, department, biography, callback) => {
  const query = "UPDATE doctor SET first_name = ?, last_name = ?, email = ?, dob = ?, gender = ?, address = ?, phone = ?, image = ?, department = ?, biography = ? WHERE id = ?";
  pool.query(query, [first_name, last_name, email, dob, gender, address, phone, image, department, biography, id], callback);
};

module.exports.deleteDoc = (id, callback) => {
  pool.query("DELETE FROM doctor WHERE id = ?", [id], callback);
};

// -----------------------------
// 🧠 EMPLOYEE
// -----------------------------

module.exports.getEmpbyId = (id, callback) => {
  pool.query("SELECT * FROM employee WHERE id = ?", [id], callback);
};

module.exports.add_employee = (name, email, contact, join_date, role, salary, callback) => {
  const query = "INSERT INTO employee (name, email, contact, join_date, role, salary) VALUES (?, ?, ?, ?, ?, ?)";
  pool.query(query, [name, email, contact, join_date, role, salary], callback);
};

module.exports.getAllemployee = (callback) => {
  pool.query('SELECT * FROM employee', callback);
};

module.exports.editEmp = (id, name, email, contact, join_date, role, callback) => {
  const query = "UPDATE employee SET name = ?, email = ?, contact = ?, join_date = ?, role = ? WHERE id = ?";
  pool.query(query, [name, email, contact, join_date, role, id], callback);
};

module.exports.deleteEmp = (id, callback) => {
  pool.query("DELETE FROM employee WHERE id = ?", [id], callback);
};

// -----------------------------
// 🧠 MEDICINE STORE
// -----------------------------

module.exports.addMed = (name, p_date, expire, e_date, price, quantity, callback) => {
  const query = "INSERT INTO store (name, p_date, expire, expire_end, price, quantity) VALUES (?, ?, ?, ?, ?, ?)";
  pool.query(query, [name, p_date, expire, e_date, price, quantity], callback);
};

module.exports.getallmed = (callback) => {
  pool.query('SELECT * FROM store ORDER BY id DESC', callback);
};

module.exports.getMedbyId = (id, callback) => {
  pool.query("SELECT * FROM store WHERE id = ?", [id], callback);
};

module.exports.editmed = (id, name, p_date, expire, e_date, price, quantity, callback) => {
  const query = "UPDATE store SET name = ?, p_date = ?, expire = ?, expire_end = ?, price = ?, quantity = ? WHERE id = ?";
  pool.query(query, [name, p_date, expire, e_date, price, quantity, id], callback);
};

module.exports.deletemed = (id, callback) => {
  pool.query("DELETE FROM store WHERE id = ?", [id], callback);
};

// -----------------------------
// 🧠 DEPARTMENTS
// -----------------------------

module.exports.add_dept = (name, desc, callback) => {
  const query = "INSERT INTO departments (department_name, department_desc) VALUES (?, ?)";
  pool.query(query, [name, desc], callback);
};

module.exports.getalldept = (callback) => {
  pool.query('SELECT * FROM departments', callback);
};

module.exports.getdeptbyId = (id, callback) => {
  pool.query("SELECT * FROM departments WHERE id = ?", [id], callback);
};

module.exports.edit_dept = (id, name, desc, callback) => {
  const query = "UPDATE departments SET department_name = ?, department_desc = ? WHERE id = ?";
  pool.query(query, [name, desc, id], callback);
};

module.exports.delete_department = (id, callback) => {
  pool.query("DELETE FROM departments WHERE id = ?", [id], callback);
};

// -----------------------------
// 🧠 APPOINTMENTS (Your original functions)
// -----------------------------

module.exports.add_appointment = (p_name, department, d_name, date, time, email, phone, callback) => {
  const query = "INSERT INTO appointment (patient_name, department, doctor_name, date, time, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)";
  pool.query(query, [p_name, department, d_name, date, time, email, phone], callback);
};

module.exports.getallappointment = (callback) => {
  pool.query('SELECT * FROM appointment', callback);
};

module.exports.getappointmentbyid = (id, callback) => {
  pool.query("SELECT * FROM appointment WHERE id = ?", [id], callback);
};

module.exports.editappointment = (id, p_name, department, d_name, date, time, email, phone, callback) => {
  const query = "UPDATE appointment SET patient_name = ?, department = ?, doctor_name = ?, date = ?, time = ?, email = ?, phone = ? WHERE id = ?";
  pool.query(query, [p_name, department, d_name, date, time, email, phone, id], callback);
};

module.exports.deleteappointment = (id, callback) => {
  pool.query("DELETE FROM appointment WHERE id = ?", [id], callback);
};

// -----------------------------
// 🧠 LEAVE MANAGEMENT
// -----------------------------

module.exports.add_leave = (name, id, type, from, to, reason, callback) => {
  const query = "INSERT INTO leaves (employee, emp_id, leave_type, date_from, date_to, reason) VALUES (?, ?, ?, ?, ?, ?)";
  pool.query(query, [name, id, type, from, to, reason], callback);
};

module.exports.getAllLeave = (callback) => {
  pool.query('SELECT * FROM leaves', callback);
};

module.exports.getleavebyid = (id, callback) => {
  pool.query("SELECT * FROM leaves WHERE id = ?", [id], callback);
};

module.exports.edit_leave = (id, name, leave_type, from, to, reason, callback) => {
  const query = "UPDATE leaves SET employee = ?, leave_type = ?, date_from = ?, date_to = ?, reason = ? WHERE id = ?";
  pool.query(query, [name, leave_type, from, to, reason, id], callback);
};

module.exports.deleteleave = (id, callback) => {
  pool.query("DELETE FROM leaves WHERE id = ?", [id], callback);
};

// -----------------------------
// 🧠 COMPLAINTS
// -----------------------------

module.exports.postcomplain = (message, name, email, subject, callback) => {
  const query = "INSERT INTO complain (message, name, email, subject) VALUES (?, ?, ?, ?)";
  pool.query(query, [message, name, email, subject], callback);
};

module.exports.getcomplain = (callback) => {
  pool.query('SELECT * FROM complain', callback);
};

// -----------------------------
// 🧠 SEARCH
// -----------------------------

module.exports.searchDoc = (key, callback) => {
  const query = "SELECT * FROM doctor WHERE first_name LIKE ?";
  pool.query(query, ['%' + key + '%'], callback);
};

module.exports.searchmed = (key, callback) => {
  const query = "SELECT * FROM store WHERE name LIKE ?";
  pool.query(query, ['%' + key + '%'], callback);
};

module.exports.searchEmp = (key, callback) => {
  const query = "SELECT * FROM employee WHERE name LIKE ?";
  pool.query(query, ['%' + key + '%'], callback);
};

// ---------------------------------------------------
// ---------------------------------------------------
// 🧠 NEW DOCTOR / PATIENT FUNCTIONS
// ---------------------------------------------------
// ---------------------------------------------------

module.exports.getAllDoctors = (callback) => {
  const query = "SELECT doctors.id, users.username, doctors.specialization, doctors.consultation_fee FROM doctors JOIN users ON doctors.user_id = users.id";
  pool.query(query, callback);
};

module.exports.getDoctorById = (id, callback) => {
  const query = "SELECT * FROM doctors WHERE id = ?";
  pool.query(query, [id], callback);
};

module.exports.createAppointment = (patientId, doctorId, date, fee, callback) => {
  const query = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, consultation_fee, status) VALUES (?, ?, ?, ?, 'Pending')";
  pool.query(query, [patientId, doctorId, date, fee], callback);
};

module.exports.getAppointmentsForPatient = (patientId, callback) => {
  const query = `
    SELECT appointments.id, appointments.appointment_date, appointments.status, users.username AS doctor_name, appointments.consultation_fee
    FROM appointments
    JOIN doctors ON appointments.doctor_id = doctors.id
    JOIN users ON doctors.user_id = users.id
    WHERE appointments.patient_id = ?
    ORDER BY appointments.appointment_date DESC
  `;
  pool.query(query, [patientId], callback);
};

module.exports.getAppointmentsForDoctor = (doctorId, callback) => {
  const query = `
    SELECT appointments.id, appointments.appointment_date, appointments.status, users.username AS patient_name, appointments.consultation_fee
    FROM appointments
    JOIN users ON appointments.patient_id = users.id
    WHERE appointments.doctor_id = ?
    ORDER BY appointments.appointment_date DESC
  `;
  pool.query(query, [doctorId], callback);
};

module.exports.updateAppointmentStatus = (appointmentId, status, callback) => {
  const query = "UPDATE appointments SET status = ? WHERE id = ?";
  pool.query(query, [status, appointmentId], callback);
};

module.exports.getDoctorIdByUserId = (userId, callback) => {
  const query = "SELECT id FROM doctors WHERE user_id = ?";
  pool.query(query, [userId], callback);
};

module.exports.addMedication = (appointmentId, name, dosage, notes, callback) => {
  const query = "INSERT INTO medications (appointment_id, medication_name, dosage, notes) VALUES (?, ?, ?, ?)";
  pool.query(query, [appointmentId, name, dosage, notes], callback);
};

module.exports.getMedicationsForAppointment = (appointmentId, callback) => {
  const query = "SELECT * FROM medications WHERE appointment_id = ?";
  pool.query(query, [appointmentId], callback);
};
module.exports.getPatientCount = (callback) => {
  const query = "SELECT COUNT(id) AS count FROM users WHERE role = 'patient'";
  pool.query(query, callback);
};

module.exports.getDoctorCount = (callback) => {
  const query = "SELECT COUNT(id) AS count FROM users WHERE role = 'doctor'";
  pool.query(query, callback);
};

module.exports.getTotalRevenue = (callback) => {
  const query = "SELECT SUM(consultation_fee) AS total FROM appointments WHERE status = 'Confirmed'";
  pool.query(query, callback);
};

module.exports.getAppointmentCounts = (callback) => {
  const query = "SELECT status, COUNT(id) AS count FROM appointments GROUP BY status";
  pool.query(query, callback);
};

// Gets all patients for the admin list
module.exports.getAllPatientsAdmin = (callback) => {
  const query = "SELECT id, username, email, email_status FROM users WHERE role = 'patient' ORDER BY id";
  pool.query(query, callback);
};

// Gets all doctors for the admin list
module.exports.getAllDoctorsAdmin = (callback) => {
  const query = `
    SELECT users.id, users.username, users.email, doctors.specialization, doctors.consultation_fee 
    FROM users 
    JOIN doctors ON users.id = doctors.user_id 
    WHERE users.role = 'doctor' 
    ORDER BY users.id
  `;
  pool.query(query, callback);
};
// -----------------------------
// 🧠 ADMIN CHARTS (NEW)
// -----------------------------

module.exports.getRevenuePerDoctor = (callback) => {
  const query = `
    SELECT users.username, SUM(appointments.consultation_fee) AS revenue
    FROM appointments
    JOIN doctors ON appointments.doctor_id = doctors.id
    JOIN users ON doctors.user_id = users.id
    WHERE appointments.status = 'Confirmed'
    GROUP BY users.username
    ORDER BY revenue DESC
  `;
  pool.query(query, callback);
};
module.exports.saveMessage = (appointmentId, senderId, message, callback) => {
  // This query is now correct and points to the new table
  const chatQuery = "INSERT INTO chat_messages (appointment_id, sender_id, message_text) VALUES (?, ?, ?)";
  pool.query(chatQuery, [appointmentId, senderId, message], callback);
};

module.exports.getChatHistory = (appointmentId, callback) => {
  const query = `
    SELECT chat_messages.*, users.username AS sender_name
    FROM chat_messages
    JOIN users ON chat_messages.sender_id = users.id
    WHERE chat_messages.appointment_id = ?
    ORDER BY chat_messages.timestamp ASC
  `;
  pool.query(query, [appointmentId], callback);
};
// -----------------------------
// 🧠 CHAT (SECURITY)
// -----------------------------

module.exports.getAppointmentParticipants = (appointmentId, callback) => {
  const query = `
    SELECT 
      appt.patient_id, 
      doc.user_id AS doctor_user_id 
    FROM appointments AS appt
    JOIN doctors AS doc ON appt.doctor_id = doc.id
    WHERE appt.id = ?
  `;
  pool.query(query, [appointmentId], callback);
};
// ---------------------------------------------------
// ---------------------------------------------------
// 🧠 DOCTOR DASHBOARD ANALYTICS (NEW)
// ---------------------------------------------------
// ---------------------------------------------------

/**
 * Gets the total earnings from all confirmed appointments for a doctor.
 */
module.exports.getDoctorAnalytics_Earnings = (doctorId, callback) => {
  const query = "SELECT SUM(consultation_fee) AS totalEarnings FROM appointments WHERE doctor_id = ? AND status = 'Confirmed'";
  pool.query(query, [doctorId], callback);
};

/**
 * Gets the total number of pending and confirmed appointments.
 */
module.exports.getDoctorAnalytics_TotalAppointments = (doctorId, callback) => {
  const query = "SELECT COUNT(id) AS totalAppointments FROM appointments WHERE doctor_id = ? AND (status = 'Confirmed' OR status = 'Pending')";
  pool.query(query, [doctorId], callback);
};

/**
 * Gets the count of unique patients this month.
 */
module.exports.getDoctorAnalytics_ActivePatients = (doctorId, callback) => {
  const query = `
    SELECT COUNT(DISTINCT patient_id) AS activePatients 
    FROM appointments 
    WHERE doctor_id = ? 
    AND MONTH(appointment_date) = MONTH(CURDATE()) 
    AND YEAR(appointment_date) = YEAR(CURDATE())
  `;
  pool.query(query, [doctorId], callback);
};

/**
 * [PLACEHOLDER] Gets the doctor's average rating.
 * NOTE: You do not have a 'reviews' or 'ratings' table.
 * This function will return 0.0 until you build that feature.
 */
module.exports.getDoctorAnalytics_AvgRating = (doctorId, callback) => {
  // This is a placeholder. You will need to create a 'reviews' table
  // and query it here (e.g., "SELECT AVG(rating) AS avgRating FROM reviews WHERE doctor_id = ?")
  // For now, we return 0.0 so the dashboard doesn't break.
  callback(null, [{ avgRating: 0.0 }]);
};

/**
 * Gets the data for the weekly appointments chart (for the current month).
 */
module.exports.getDoctorChart_Appointments = (doctorId, callback) => {
  const query = `
    SELECT 
      WEEK(appointment_date, 1) AS week_num, 
      COUNT(id) AS count 
    FROM appointments 
    WHERE doctor_id = ? 
    AND MONTH(appointment_date) = MONTH(CURDATE()) 
    AND YEAR(appointment_date) = YEAR(CURDATE()) 
    GROUP BY week_num 
    ORDER BY week_num
  `;
  pool.query(query, [doctorId], callback);
};

/**
 * Gets the data for the weekly earnings chart (for the current month).
 */
module.exports.getDoctorChart_Earnings = (doctorId, callback) => {
  const query = `
    SELECT 
      WEEK(appointment_date, 1) AS week_num, 
      SUM(consultation_fee) AS earnings 
    FROM appointments 
    WHERE doctor_id = ? 
    AND status = 'Confirmed' 
    AND MONTH(appointment_date) = MONTH(CURDATE()) 
    AND YEAR(appointment_date) = YEAR(CURDATE()) 
    GROUP BY week_num 
    ORDER BY week_num
  `;
  pool.query(query, [doctorId], callback);
};


// ---------------------------------------------------
// ---------------------------------------------------
// 🧠 ADMIN DASHBOARD ANALYTICS (NEW)
// ---------------------------------------------------
// ---------------------------------------------------

/**
 * Gets total revenue from the last full month.
 */
module.exports.getRevenueLastMonth = (callback) => {
  const query = `
    SELECT SUM(consultation_fee) AS total 
    FROM appointments 
    WHERE status = 'Confirmed' 
    AND YEAR(appointment_date) = YEAR(CURDATE() - INTERVAL 1 MONTH)
    AND MONTH(appointment_date) = MONTH(CURDATE() - INTERVAL 1 MONTH)
  `;
  pool.query(query, callback);
};

/**
 * Gets total revenue from the month before last (for calculating growth).
 */
module.exports.getRevenuePreviousMonth = (callback) => {
  const query = `
    SELECT SUM(consultation_fee) AS total 
    FROM appointments 
    WHERE status = 'Confirmed' 
    AND YEAR(appointment_date) = YEAR(CURDATE() - INTERVAL 2 MONTH)
    AND MONTH(appointment_date) = MONTH(CURDATE() - INTERVAL 2 MONTH)
  `;
  pool.query(query, callback);
};

/**
 * Gets confirmed appointments in the last 30 days.
 */
module.exports.getAppointmentsLast30Days = (callback) => {
  const query = `
    SELECT COUNT(id) AS count 
    FROM appointments 
    WHERE status = 'Confirmed' 
    AND appointment_date >= CURDATE() - INTERVAL 30 DAY
  `;
  pool.query(query, callback);
};

/**
 * Gets new patients who registered this month.
 * NOTE: This assumes your 'users' table has a 'created_at' timestamp column.
 * If not, this will return 0.
 */
module.exports.getNewPatientsThisMonth = (callback) => {
  // IMPORTANT: If you do not have a 'created_at' column, this query must be changed.
  // For now, we add a fallback to prevent errors.
  const query = `
    SELECT COUNT(id) AS count 
    FROM users 
    WHERE role = 'patient' 
    AND MONTH(created_at) = MONTH(CURDATE()) 
    AND YEAR(created_at) = YEAR(CURDATE())
  `;
  
  pool.query(query, (err, results) => {
    if (err) {
      // This will catch if the 'created_at' column is missing.
      console.warn("WARN: 'created_at' column not found in 'users' table. Returning 0 for new patients.");
      callback(null, [{ count: 0 }]); // Return 0 safely
    } else {
      callback(null, results);
    }
  });
};

/**
 * Gets revenue and appointment counts grouped by department (doctor specialization).
 */
module.exports.getDepartmentPerformance = (callback) => {
  const query = `
    SELECT 
      d.specialization AS name, 
      SUM(a.consultation_fee) AS revenue, 
      COUNT(a.id) AS appointments 
    FROM appointments a 
    JOIN doctors d ON a.doctor_id = d.id 
    WHERE a.status = 'Confirmed' 
    GROUP BY d.specialization
    ORDER BY revenue DESC
  `;
  pool.query(query, callback);
};

/**
 * Gets data for the monthly revenue trend chart (all 12 months).
 */
module.exports.getMonthlyRevenueTrend = (callback) => {
  const query = `
    SELECT 
      MONTH(appointment_date) AS month_num, 
      SUM(consultation_fee) AS revenue 
    FROM appointments 
    WHERE status = 'Confirmed' 
    AND YEAR(appointment_date) = YEAR(CURDATE()) 
    GROUP BY month_num 
    ORDER BY month_num
  `;
  pool.query(query, callback);
};

/**
 * Gets data for the weekly appointments trend chart (last 8 weeks).
 */
module.exports.getAppointmentsTrend = (callback) => {
  const query = `
    SELECT 
      WEEK(appointment_date) AS week_num, 
      COUNT(id) AS count 
    FROM appointments 
    WHERE appointment_date >= CURDATE() - INTERVAL 8 WEEK 
    GROUP BY week_num 
    ORDER BY week_num
  `;
  pool.query(query, callback);
};

/**
 * Gets data for the top doctors leaderboard.
 */
module.exports.getTopDoctorsLeaderboard = (callback) => {
  const query = `
    SELECT 
      u.username, 
      d.specialization, 
      COUNT(DISTINCT a.patient_id) AS patientsSeen, 
      SUM(a.consultation_fee) AS totalRevenue 
    FROM appointments a 
    JOIN doctors d ON a.doctor_id = d.id 
    JOIN users u ON d.user_id = u.id 
    WHERE a.status = 'Confirmed' 
    GROUP BY u.username, d.specialization 
    ORDER BY totalRevenue DESC
  `;
  // We add a 'rating' placeholder, as your DB doesn't have one
  pool.query(query, (err, results) => {
    if (err) return callback(err);
    const finalResults = results.map(row => ({
      ...row,
      rating: 4.5 // Placeholder rating
    }));
    callback(null, [finalResults]); // Re-nest in an array to match other results
  });
};