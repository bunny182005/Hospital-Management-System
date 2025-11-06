var express = require('express');
var session = require('express-session');
var cookie = require('cookie-parser');
var path = require('path');
var ejs = require('ejs');
var multer = require('multer');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var expressValidator = require('express-validator');
var sweetalert = require('sweetalert2');

// --- NEW IMPORTS ---
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var { PythonShell } = require('python-shell'); // 👈 Python bridge
var bodyParser = require('body-parser');
// --------------------

// --- ALL YOUR CONTROLLERS ---
var login = require('./controllers/login');
var home = require('./controllers/home');
var signup = require('./controllers/signup');
var db = require('./models/db_controller');
var logout = require('./controllers/logout');
var verify = require('./controllers/verify');
var landing = require('./controllers/landing');
var appointment = require('./controllers/appointment');
var doctor = require('./controllers/doctor');
var admin = require('./controllers/admin');
var video = require('./controllers/video');
var signupController = require('./controllers/signup');

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookie());

// --- SESSION CONFIG ---
const sessionMiddleware = session({
  secret: 'your_strong_secret_key_here',
  resave: false,
  saveUninitialized: true
});

app.use(sessionMiddleware);

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
require('./controllers/socket_controller')(io);

// --- ALL YOUR ROUTES ---
app.use('/login', login);
app.use('/home', home);
app.use('/signup', signup);
app.use('/logout', logout);
app.use('/verify', verify);
app.use('/', landing);
app.use('/appointment', appointment);
app.use('/doctor', doctor);
app.use('/admin', admin);
app.use('/video', video);
app.use('/register', signupController);

// ✅ --- CHATBOT ENDPOINT DIRECTLY HERE ---
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const options = {
    mode: 'json',
    pythonOptions: ['-u'],
    scriptPath: path.join(__dirname, './chatbot'),
  };

  const pyshell = new PythonShell('run_chatbot.py', options);
  pyshell.send({ message });

  let resultData = '';

  pyshell.on('message', (result) => {
    resultData = result;
  });

  pyshell.end((err) => {
    if (err) {
      console.error('❌ Chatbot Python error:', err);
      return res.status(500).json({ error: 'Chatbot processing error' });
    }
    res.json(resultData);
  });
});
// ✅ --------------------------------------

// --- SERVER START ---
server.listen(3000, function () {
  console.log('✅ Server started on port 3000');
});
