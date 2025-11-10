const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const mongoose = require('mongoose');

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

// Mongoose User model (for persistence)
let dbReady = false;
let User;
try {
  const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, index: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty', 'admin'], required: true },
    name: String,
    roll: String,
    createdAt: { type: Date, default: Date.now },
    faceDesc: { type: [Number] } // stored normalized descriptor
  });
  User = mongoose.models.User || mongoose.model('User', userSchema);
} catch {}

// DB connection is handled at the bottom with startServer()

const app = express();

const PORT = process.env.PORT || 5000;
const USE_IN_MEMORY = (process.env.USE_IN_MEMORY === 'true') || (process.env.DISABLE_DB === 'true');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// File upload (memory storage)
let multer;
try {
  multer = require('multer');
} catch {}
const upload = multer ? multer({ storage: (multer.memoryStorage ? multer.memoryStorage() : undefined) }) : null;

// In-memory database (replace with MongoDB/PostgreSQL in production)
let users = [
  {
    id: 1,
    username: 'admin12',
    email: 'admin@examportal.com',
    password: '$2a$10$rOzJqZJqZJqZJqZJqZJqZ.OqZJqZJqZJqZJqZJqZJqZJqZJqZJq',
    role: 'admin',
    name: 'Admin User',
    createdAt: new Date()
  }
];

let exams = [
  {
    id: 1,
    title: 'Web Development Fundamentals',
    category: 'Technical',
    duration: 30,
    totalQuestions: 10,
    createdAt: '2024-01-15',
    status: 'active',
    createdBy: 1
  },
  {
    id: 2,
    title: 'General Knowledge Test',
    category: 'General',
    duration: 20,
    totalQuestions: 15,
    createdAt: '2024-01-16',
    status: 'active',
    createdBy: 1
  }
];

// Additional seed exams (general and technical)
exams.push(
  {
    id: 3,
    title: 'Data Structures & Algorithms',
    category: 'Technical',
    duration: 40,
    totalQuestions: 12,
    createdAt: '2024-02-01',
    status: 'active',
    createdBy: 1
  },
  {
    id: 4,
    title: 'JavaScript Fundamentals',
    category: 'Technical',
    duration: 25,
    totalQuestions: 10,
    createdAt: '2024-02-02',
    status: 'active',
    createdBy: 1
  },
  {
    id: 5,
    title: 'Computer Networks Basics',
    category: 'Technical',
    duration: 20,
    totalQuestions: 8,
    createdAt: '2024-02-03',
    status: 'active',
    createdBy: 1
  },
  {
    id: 6,
    title: 'Aptitude & Reasoning',
    category: 'General',
    duration: 30,
    totalQuestions: 12,
    createdAt: '2024-02-04',
    status: 'active',
    createdBy: 1
  },
  {
    id: 7,
    title: 'English Grammar & Vocabulary',
    category: 'General',
    duration: 20,
    totalQuestions: 10,
    createdAt: '2024-02-05',
    status: 'active',
    createdBy: 1
  },
  {
    id: 8,
    title: 'Logical Reasoning',
    category: 'General',
    duration: 25,
    totalQuestions: 10,
    createdAt: '2024-02-06',
    status: 'active',
    createdBy: 1
  }
);

let questions = {
  1: [
    {
      id: 1,
      type: 'mcq',
      question: 'What does HTML stand for?',
      options: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'Hyperlinking Text Marking Language'],
      correctAnswer: 0
    },
    {
      id: 2,
      type: 'coding',
      question: 'Write a function to reverse a string in JavaScript.',
      placeholder: '// Your code here\nfunction reverseString(str) {\n  // Write your code\n}'
    },
    {
      id: 3,
      type: 'mcq',
      question: 'Which of the following is NOT a JavaScript framework?',
      options: ['React', 'Angular', 'Vue', 'Django'],
      correctAnswer: 3
    }
  ],
  2: [
    {
      id: 1,
      type: 'mcq',
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 2
    },
    {
      id: 2,
      type: 'mcq',
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 1
    }
  ]
};

// Questions for newly seeded exams
questions[3] = [
  { id: 1, type: 'mcq', question: 'Which data structure uses FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correctAnswer: 1 },
  { id: 2, type: 'mcq', question: 'Inorder traversal of BST gives:', options: ['Random', 'Sorted', 'Reverse', 'Level order'], correctAnswer: 1 },
  { id: 3, type: 'mcq', question: 'Time complexity of binary search:', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctAnswer: 1 }
];

questions[4] = [
  { id: 1, type: 'mcq', question: 'typeof null equals:', options: ['null', 'object', 'undefined', 'boolean'], correctAnswer: 1 },
  { id: 2, type: 'mcq', question: 'Array method to transform elements:', options: ['forEach', 'map', 'filter', 'reduce'], correctAnswer: 1 },
  { id: 3, type: 'mcq', question: 'Template literals use:', options: ['"', "'", '`', '~'], correctAnswer: 2 }
];

questions[5] = [
  { id: 1, type: 'mcq', question: 'HTTP default port:', options: ['21', '25', '80', '443'], correctAnswer: 2 },
  { id: 2, type: 'mcq', question: 'Secure HTTP protocol:', options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'], correctAnswer: 1 },
  { id: 3, type: 'mcq', question: 'Router works at OSI layer:', options: ['2', '3', '4', '7'], correctAnswer: 1 }
];

questions[6] = [
  { id: 1, type: 'mcq', question: 'Find the next number: 2, 6, 12, 20, ?', options: ['24', '28', '30', '40'], correctAnswer: 1 },
  { id: 2, type: 'mcq', question: 'If A=1, B=2 then Z=?', options: ['24', '25', '26', '27'], correctAnswer: 2 },
  { id: 3, type: 'mcq', question: 'A train 120m long passes a pole in 6s. Speed?', options: ['20 m/s', '15 m/s', '10 m/s', '5 m/s'], correctAnswer: 2 }
];

questions[7] = [
  { id: 1, type: 'mcq', question: 'Choose the correct sentence:', options: ["He don't like tea.", "He doesn't like tea.", 'He not like tea.', 'He no like tea.'], correctAnswer: 1 },
  { id: 2, type: 'mcq', question: 'Antonym of difficult:', options: ['hard', 'easy', 'tough', 'rough'], correctAnswer: 1 },
  { id: 3, type: 'mcq', question: 'Fill in the blank: She ____ to school.', options: ['go', 'goes', 'going', 'gone'], correctAnswer: 1 }
];

questions[8] = [
  { id: 1, type: 'mcq', question: 'All squares are rectangles. All rectangles are polygons. Therefore, all squares are polygons. This is:', options: ['Invalid', 'Valid', 'Insufficient data', 'Paradox'], correctAnswer: 1 },
  { id: 2, type: 'mcq', question: 'Which does not belong: 3, 5, 7, 9, 11', options: ['3', '5', '7', '9'], correctAnswer: 3 },
  { id: 3, type: 'mcq', question: 'If SOME = 58, then FEW = ?', options: ['28', '23', '32', '35'], correctAnswer: 2 }
];

// In-memory WebAuthn storage (demo only)
const passkeysByUserId = new Map(); // userId -> [credentials]
const currentChallenges = new Map(); // userId -> { reg: string, auth: string }

const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// Hash password helper
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Initialize admin (in-memory and DB)
const initializeAdmin = async () => {
  const adminPassword = await hashPassword('admin123');
  // In-memory seed
  if (users && users[0]) users[0].password = adminPassword;

  // DB seed if ready
  if (dbReady && User) {
    const existing = await User.findOne({ username: 'admin12' }).lean();
    if (!existing) {
      await User.create({
        username: 'admin12',
        email: 'admin@examportal.com',
        password: adminPassword,
        role: 'admin',
        name: 'Admin User',
        roll: 'ADM001'
      });
    }
  }
};
initializeAdmin();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'exam-portal-backend', time: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: !!dbReady, time: new Date().toISOString() });
});

// Signup
app.post('/api/signup',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student', 'faculty']).withMessage('Role must be student or faculty'),
    body('name').trim().notEmpty().withMessage('Name is required')
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role, name, roll, faceDesc } = req.body;

    // Check if user exists
    if (dbReady && User) {
      const exists = await User.findOne({ $or: [{ username }, { email }] }).lean();
      if (exists) return res.status(400).json({ error: 'Username or email already exists' });
    } else if (users.find(u => u.username === username || u.email === email)) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    try {
      const hashedPassword = await hashPassword(password);
      let newUser;
      if (dbReady && User) {
        newUser = await User.create({
          username,
          email,
          password: hashedPassword,
          role,
          name,
          roll: roll || undefined,
          faceDesc: Array.isArray(faceDesc) && faceDesc.length >= 64 ? faceDesc.map(Number) : undefined
        });
      } else {
        newUser = {
          id: users.length + 1,
          username,
          email,
          password: hashedPassword,
          role,
          name,
          roll: roll || `STU${String(users.length + 1).padStart(3, '0')}`,
          createdAt: new Date(),
          faceDesc: Array.isArray(faceDesc) && faceDesc.length >= 64 ? faceDesc.map(Number) : undefined
        };
        users.push(newUser);
      }

      const token = jwt.sign(
        { id: (newUser._id || newUser.id), username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: (newUser._id || newUser.id),
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          name: newUser.name,
          roll: newUser.roll
        }
      });
    } catch (error) {
      if (error && (error.code === 11000 || (error.message && error.message.includes('duplicate key')))) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      console.error('Signup error:', error?.message || error);
      res.status(500).json({ error: 'Server error during signup' });
    }
  }
);

// Face login (Faculty) - trusts client-side match for demo purposes
app.post('/api/face-login', async (req, res) => {
  try {
    const { username, faceDesc } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });
    let user = null;
    if (dbReady && User) {
      user = await User.findOne({ username, role: 'faculty' }).lean();
    } else {
      user = users.find(u => u.username === username && (u.role === 'faculty' || u.role === 'admin'));
    }
    if (!user) return res.status(404).json({ error: 'Faculty user not found' });

    if (!Array.isArray(faceDesc) || faceDesc.length < 64) {
      return res.status(400).json({ error: 'Face descriptor missing or invalid' });
    }
    if (!Array.isArray(user.faceDesc) || user.faceDesc.length < 64) {
      return res.status(400).json({ error: 'No face descriptor registered for this user' });
    }

    // Cosine similarity
    const a = user.faceDesc.map(Number);
    const b = faceDesc.map(Number);
    const dot = a.reduce((s, v, i) => s + v * (b[i] || 0), 0);
    const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0)) || 1;
    const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0)) || 1;
    const cosine = dot / (normA * normB);

    const THRESHOLD = 0.98; // stricter threshold
    if (cosine < THRESHOLD) {
      return res.status(401).json({ error: 'Face verification failed' });
    }

    const token = jwt.sign(
      { id: (user._id || user.id), username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Face login successful',
      similarity: Number(cosine.toFixed(4)),
      token,
      user: {
        id: (user._id || user.id),
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        roll: user.roll
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during face login' });
  }
});

// WebAuthn: Generate registration options (Faculty only)
app.post('/api/webauthn/generate-registration-options', async (req, res) => {
  try {
    const { username } = req.body;
    const user = dbReady && User
      ? (await User.findOne({ username }).lean())
      : users.find(u => u.username === username);
    if (!user || user.role !== 'faculty') {
      return res.status(400).json({ error: 'Faculty user not found' });
    }

    const existingCreds = passkeysByUserId.get(user.id) || [];
    const options = await generateRegistrationOptions({
      rpName: 'Online Examination Portal',
      rpID,
      userID: String(user.id),
      userName: user.username,
      attestationType: 'none',
      excludeCredentials: existingCreds.map(c => ({ id: c.credentialID, type: 'public-key' })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred'
      }
    });

    const c = currentChallenges.get(user.id) || {};
    c.reg = options.challenge;
    currentChallenges.set(user.id, c);

    res.json(options);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate registration options' });
  }
});

// WebAuthn: Verify registration response
app.post('/api/webauthn/verify-registration', async (req, res) => {
  try {
    const { username, attResp } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || user.role !== 'faculty') {
      return res.status(400).json({ error: 'Faculty user not found' });
    }
    const expectedChallenge = currentChallenges.get(user.id)?.reg;
    if (!expectedChallenge) return res.status(400).json({ error: 'No registration in progress' });

    const verification = await verifyRegistrationResponse({
      response: attResp,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'Registration verification failed' });
    }

    const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;
    const list = passkeysByUserId.get(user.id) || [];
    list.push({ credentialID, credentialPublicKey, counter });
    passkeysByUserId.set(user.id, list);

    const c = currentChallenges.get(user.id) || {};
    delete c.reg;
    currentChallenges.set(user.id, c);

    res.json({ verified: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to verify registration' });
  }
});

// WebAuthn: Generate authentication options
app.post('/api/webauthn/generate-authentication-options', async (req, res) => {
  try {
    const { username } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || user.role !== 'faculty') {
      return res.status(400).json({ error: 'Faculty user not found' });
    }
    const creds = passkeysByUserId.get(user.id) || [];
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      allowCredentials: creds.map(c => ({ id: c.credentialID, type: 'public-key' }))
    });
    const c = currentChallenges.get(user.id) || {};
    c.auth = options.challenge;
    currentChallenges.set(user.id, c);
    res.json(options);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate authentication options' });
  }
});

// WebAuthn: Verify authentication response and issue JWT
app.post('/api/webauthn/verify-authentication', async (req, res) => {
  try {
    const { username, authResp } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || user.role !== 'faculty') {
      return res.status(400).json({ error: 'Faculty user not found' });
    }
    const expectedChallenge = currentChallenges.get(user.id)?.auth;
    if (!expectedChallenge) return res.status(400).json({ error: 'No authentication in progress' });

    const creds = passkeysByUserId.get(user.id) || [];
    const credential = creds.find(c => Buffer.compare(c.credentialID, Buffer.from(authResp.rawId, 'base64url')) === 0);

    const verification = await verifyAuthenticationResponse({
      response: authResp,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: credential
        ? {
            credentialID: credential.credentialID,
            credentialPublicKey: credential.credentialPublicKey,
            counter: credential.counter
          }
        : undefined
    });

    if (!verification.verified || !verification.authenticationInfo) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Update counter
    if (credential) {
      credential.counter = verification.authenticationInfo.newCounter;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const c = currentChallenges.get(user.id) || {};
    delete c.auth;
    currentChallenges.set(user.id, c);

    res.json({
      verified: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        roll: user.roll
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to verify authentication' });
  }
});

// Login
app.post('/api/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, faceDesc } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Face verification disabled: allow faculty to login with username/password only

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: (user._id || user.id),
          username: user.username,
          email: user.email,
          role: user.role,
          name: user.name,
          roll: user.roll
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error during login' });
    }
  }
);

// Get current user
app.get('/api/me', authenticateToken, async (req, res) => {
  if (dbReady && User) {
    const user = await User.findById(req.user.id).lean();
    if (user) {
      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        roll: user.roll
      });
    }
  }
  const mem = users.find(u => u.id === req.user.id);
  if (mem) {
    return res.json({
      id: mem.id,
      username: mem.username,
      email: mem.email,
      role: mem.role,
      name: mem.name,
      roll: mem.roll
    });
  }
  // Fallback to JWT claims
  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: undefined,
    role: req.user.role,
    name: req.user.username,
    roll: undefined
  });
});

// Get exams (with dynamic question counts)
app.get('/api/exams', authenticateToken, (req, res) => {
  const list = exams.map(e => ({
    ...e,
    totalQuestions: Array.isArray(questions[e.id]) ? questions[e.id].length : (e.totalQuestions || 0)
  }));
  res.json(list);
});

// Get exam questions
app.get('/api/exams/:id/questions', authenticateToken, (req, res) => {
  const examId = parseInt(req.params.id);
  const examQuestions = questions[examId] || [];
  res.json(examQuestions);
});

// Get exam by ID (with dynamic question count)
app.get('/api/exams/:id', authenticateToken, (req, res) => {
  const examId = parseInt(req.params.id);
  const exam = exams.find(e => e.id === examId);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found' });
  }
  const enriched = {
    ...exam,
    totalQuestions: Array.isArray(questions[examId]) ? questions[examId].length : (exam.totalQuestions || 0)
  };
  res.json(enriched);
});

// Store exam submissions
let submissions = [];

// Create exam (Admin/Faculty only)
app.post('/api/exams', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { title, category, duration, totalQuestions, questions: examQuestions } = req.body;

  const newExam = {
    id: exams.length + 1,
    title,
    category,
    duration,
    totalQuestions,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'active',
    createdBy: req.user.id
  };

  exams.push(newExam);

  if (examQuestions && examQuestions.length > 0) {
    questions[newExam.id] = examQuestions;
  }

  res.status(201).json(newExam);
});

// Upload/Update questions for an exam (Admin/Faculty only)
app.post('/api/exams/:id/questions', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const examId = parseInt(req.params.id);
  const { questions: examQuestions } = req.body;

  if (!examQuestions || !Array.isArray(examQuestions)) {
    return res.status(400).json({ error: 'Invalid questions format' });
  }

  // Validate and process questions
  const processedQuestions = examQuestions.map((q, index) => ({
    id: q.id || index + 1,
    type: q.type || 'mcq',
    question: q.question,
    options: q.options || [],
    correctAnswer: q.correctAnswer,
    placeholder: q.placeholder,
    marks: q.marks || 1,
    description: q.description
  }));

  questions[examId] = processedQuestions;

  // Update exam total questions
  const exam = exams.find(e => e.id === examId);
  if (exam) {
    exam.totalQuestions = processedQuestions.length;
  }

  res.json({ 
    message: 'Questions uploaded successfully',
    count: processedQuestions.length 
  });
});

// Upload questions via PDF (Admin/Faculty only)
app.post('/api/exams/:id/questions/upload-pdf', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!upload) {
    return res.status(500).json({ error: 'File upload not available. Please ensure multer is installed.' });
  }

  const handler = upload.single('file');
  handler(req, res, async (err) => {
    if (err) return res.status(400).json({ error: 'Failed to process upload' });
    const examId = parseInt(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    // Dynamically require pdf-parse to avoid startup crash if missing
    let pdfParse;
    try {
      pdfParse = require('pdf-parse');
    } catch (e) {
      return res.status(500).json({ error: 'pdf-parse is not installed. Run: npm i pdf-parse' });
    }

    try {
      const data = await pdfParse(req.file.buffer);
      const text = (data && data.text) ? data.text : '';
      if (!text.trim()) return res.status(400).json({ error: 'Unable to extract text from PDF' });

      // Parse questions from text
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const parsed = [];
      let cur = null;
      const optRegex = /^[A-D][\).\:]\s*(.*)$/i;

      const pushCurrent = () => {
        if (!cur) return;
        // Clean up MCQ options; ensure indexes
        if (cur.type === 'mcq' && Array.isArray(cur.options)) {
          cur.options = cur.options.filter(o => typeof o === 'string' && o.length > 0);
          if (typeof cur.correctAnswer === 'string') {
            const letter = cur.correctAnswer.trim().toUpperCase();
            const map = { A: 0, B: 1, C: 2, D: 3 };
            cur.correctAnswer = map[letter];
          }
          if (typeof cur.correctAnswer !== 'number' || cur.correctAnswer < 0 || cur.correctAnswer >= cur.options.length) {
            delete cur.correctAnswer; // allow manual grading if missing
          }
        }
        parsed.push(cur);
        cur = null;
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Start of question: lines beginning with Q, digit, or plain text followed by '?'
        if (/^(Q\s*\d+[:.)-]?\s*)/i.test(line) || /\?\s*$/.test(line)) {
          if (cur) pushCurrent();
          cur = { id: parsed.length + 1, type: 'mcq', question: line.replace(/^Q\s*\d+[:.)-]?\s*/i, '').trim(), options: [] };
          continue;
        }
        // Options A/B/C/D
        const m = line.match(optRegex);
        if (m && cur) {
          cur.options = cur.options || [];
          cur.options.push(m[1].trim());
          continue;
        }
        // Correct answer line
        if (/^correct\s*[:=]\s*/i.test(line) && cur) {
          cur.correctAnswer = line.replace(/^correct\s*[:=]\s*/i, '').trim();
          continue;
        }
        // Coding type
        if (/^type\s*[:=]\s*coding/i.test(line)) {
          if (!cur) cur = { id: parsed.length + 1 };
          cur.type = 'coding';
          continue;
        }
        // Placeholder for coding
        if (/^placeholder\s*[:=]\s*/i.test(line)) {
          if (!cur) cur = { id: parsed.length + 1 };
          cur.placeholder = line.replace(/^placeholder\s*[:=]\s*/i, '');
          continue;
        }
        // Append to question text if current exists and not an option/correct line
        if (cur && !optRegex.test(line)) {
          cur.question = (cur.question ? `${cur.question} ${line}` : line).trim();
        }
      }
      if (cur) pushCurrent();

      // Filter out invalid
      const processedQuestions = parsed
        .filter(q => q && q.question)
        .map((q, idx) => ({
          id: idx + 1,
          type: q.type || (q.options && q.options.length ? 'mcq' : 'coding'),
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          placeholder: q.placeholder,
          marks: 1
        }));

      if (processedQuestions.length === 0) {
        return res.status(400).json({ error: 'No questions detected in PDF. Ensure format uses Q:, options A)/B)/C)/D), and Correct: X' });
      }

      questions[examId] = processedQuestions;
      const exam = exams.find(e => e.id === examId);
      if (exam) {
        exam.totalQuestions = processedQuestions.length;
      }

      res.json({ message: 'PDF parsed successfully', count: processedQuestions.length });
    } catch (e) {
      console.error('PDF parse error', e);
      res.status(500).json({ error: 'Failed to parse PDF. Ensure it contains selectable text (not scanned images).' });
    }
  });
});

// Get analytics for an exam (Admin/Faculty only)
app.get('/api/exams/:id/analytics', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const examId = parseInt(req.params.id);
  const examSubmissions = submissions.filter(s => s.examId === examId);

  const totalSubmissions = examSubmissions.length;
  const avgScore = totalSubmissions > 0 
    ? examSubmissions.reduce((sum, s) => sum + s.percentage, 0) / totalSubmissions 
    : 0;
  const passCount = examSubmissions.filter(s => s.percentage >= 70).length;
  const failCount = totalSubmissions - passCount;

  res.json({
    examId,
    totalSubmissions,
    averageScore: Math.round(avgScore),
    passCount,
    failCount,
    passRate: totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0,
    submissions: examSubmissions
  });
});

// Get all submissions (Admin/Faculty only)
app.get('/api/exams/:id/submissions', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const examId = parseInt(req.params.id);
  const examSubmissions = submissions.filter(s => s.examId === examId);
  res.json(examSubmissions);
});

// Get current student's submissions and aggregated performance
app.get('/api/my/submissions', authenticateToken, (req, res) => {
  const mySubs = submissions.filter(s => s.studentId === req.user.id);
  const completed = mySubs.length;
  const performance = completed > 0
    ? Math.round(mySubs.reduce((sum, s) => sum + (typeof s.percentage === 'number' ? s.percentage : 0), 0) / completed)
    : 0;

  res.json({
    completed,
    performance,
    submissions: mySubs
  });
});

// Manual evaluation for coding questions (Admin/Faculty only)
app.post('/api/exams/:id/evaluate', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const examId = parseInt(req.params.id);
  const { submissionId, evaluations } = req.body;

  const submission = submissions.find(s => s.id === submissionId && s.examId === examId);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  // Update manual evaluations
  if (evaluations) {
    submission.manualEvaluations = evaluations;
    
    // Recalculate score
    const examQuestions = questions[examId] || [];
    let totalScore = submission.score || 0;
    let totalMarks = examQuestions.filter(q => q.type === 'mcq').length;

    Object.keys(evaluations).forEach(qId => {
      const eval = evaluations[qId];
      if (eval.marks !== undefined) {
        totalScore += eval.marks;
        totalMarks += eval.maxMarks || 1;
      }
    });

    submission.score = totalScore;
    submission.total = totalMarks;
    submission.percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
  }

  res.json(submission);
});

// Export results as Excel
app.get('/api/exams/:id/export/excel', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const examId = parseInt(req.params.id);
  const examSubmissions = submissions.filter(s => s.examId === examId);
  const exam = exams.find(e => e.id === examId);

  // Format data for Excel
  const excelData = examSubmissions.map(sub => ({
    'Student Name': sub.studentName,
    'Roll Number': sub.rollNumber || 'N/A',
    'Score': sub.score,
    'Total': sub.total,
    'Percentage': sub.percentage + '%',
    'Tab Switches': sub.tabSwitches,
    'Submitted At': new Date(sub.submittedAt).toLocaleString()
  }));

  res.json({
    examTitle: exam?.title || 'Exam',
    data: excelData
  });
});

// Update exam submission to store it
app.post('/api/exams/:id/submit', authenticateToken, (req, res) => {
  const examId = parseInt(req.params.id);
  const { answers, tabSwitches } = req.body;

  const examQuestions = questions[examId] || [];
  let score = 0;
  let totalMCQ = 0;

  examQuestions.forEach(q => {
    if (q.type === 'mcq') {
      totalMCQ++;
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    }
  });

  const student = users.find(u => u.id === req.user.id) || {};

  const submission = {
    id: submissions.length + 1,
    examId,
    studentId: req.user.id,
    studentName: student.name || req.user.username,
    rollNumber: student.roll,
    score,
    total: totalMCQ,
    percentage: totalMCQ > 0 ? Math.round((score / totalMCQ) * 100) : 0,
    tabSwitches: tabSwitches || 0,
    answers,
    submittedAt: new Date(),
    manualEvaluations: {}
  };

  submissions.push(submission);

  res.json({
    score,
    total: totalMCQ,
    percentage: submission.percentage,
    tabSwitches: tabSwitches || 0,
    answers,
    submittedAt: submission.submittedAt,
    submissionId: submission.id
  });
});

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

const startServer = (port = PORT, attempts = 0) => {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Admin credentials: username: admin12, password: admin123`);
  });
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && attempts < 10) {
      const nextPort = port + 1;
      console.warn(`Port ${port} in use. Retrying on port ${nextPort}...`);
      startServer(nextPort, attempts + 1);
    } else {
      throw err;
    }
  });
};

if (MONGO_URI && !USE_IN_MEMORY) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB Atlas');
      dbReady = true;
      initializeAdmin();
      startServer();
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err.message);
      process.exit(1);
    });
} else {
  console.warn('Starting server with in-memory storage only (DB disabled or no URI).');
  startServer();
}
