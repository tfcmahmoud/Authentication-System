const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const app = express();
const bcrypt = require('bcryptjs');
const fs = require('fs')
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const jsonConfig = require('./config.json')
const mongoSchema = require('./Schema/Users')

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory
app.use(helmet()); // Enable various HTTP security headers
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(jsonConfig['mongodbURI']);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define user schema and model
const userSchema = mongoSchema.userSchema

// Hash password before saving
userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        
        // Generate account token
        const accountToken = crypto.randomBytes(20).toString('hex');
        const hashedAccountToken = crypto.createHash('sha256').update(accountToken).digest('hex');
        this.accountToken = hashedAccountToken;

        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

// Nodemailer setup
const transporter = nodemailer.createTransport({
    // Configure your email service here
   service: jsonConfig['email']['service'],
   host: jsonConfig['email']['host'],
   port: jsonConfig['email']['port'],
   secure: jsonConfig['email']['secure'],
   auth: {
    user: jsonConfig['email']['auth']['user'],
    pass:  jsonConfig['email']['auth']['pass'],
   },
   tls: {
    rejectUnauthorized: false // Disable certificate validation
}
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/main.html');
});

app.get('/login', async(req, res) => {
    if (req.cookies['accountToken']) {
        const user = await User.findOne({ accountToken: req.cookies['accountToken'] });
        if (user && user.emailVerified) {
            return res.redirect('/dashboard')
        } else {
            res.sendFile(__dirname + '/public/html/login.html');
        }
        
    } else {
        res.sendFile(__dirname + '/public/html/login.html');
    }
});

app.get('/dashboard', async (req, res) => {
    if (!req.cookies['accountToken']) {
        res.redirect('/login')
    } else {
        let token = req.cookies['accountToken']
        const user = await User.findOne({ accountToken: token });
        if (!user) {
            res.clearCookie('accountToken')
            return res.redirect('/login')
        }
        if (!user.emailVerified) return res.redirect('/login')
        let file = fs.readFileSync('./public/html/dashboard.html', {encoding: 'utf-8'})
        file = file
        .replaceAll('$$username$$', user.username)
        res.send(file);
    }
});


app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({'message': 'Username or email already exists'});
        }

        // Create new user
        const newUser = new User({ username, email, password });

        // Generate email verification token
        const token = crypto.randomBytes(20).toString('hex');
        newUser.emailVerificationToken = token;

        // Save user
        await newUser.save();

        res.cookie('accountToken', newUser.accountToken, { maxAge: 86400000 })

        // Send verification email
        const mailOptions = {
            to: email,
            subject: 'Email Verification',
            text: `Welcome to our app! Please click on the following link to verify your email address:\n\n`
                + `http://${req.headers.host}/verify-email/${token}\n\n`
                + `If you did not sign up for this service, you can ignore this email.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).json({'message': 'Failed to send verification email'});
            }
            console.log('Verification email sent:', info.response);
            res.json({'message': 'Signup successful! Please check your email for verification.'});
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({'message': 'Internal Server Error'});
    }
});

app.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Find user by verification token
        const user = await User.findOne({ emailVerificationToken: token });
        if (!user) {
            return res.status(400).send('Invalid verification token');
        }

        // Mark email as verified
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        res.redirect('/dashboard')
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username / email
        let user = await User.findOne({ username });
        if (!user) {
            user = await User.findOne({ email: username })
            if (!user) {
                return res.status(401).json({'message': 'Invalid credentials'});
            }
        }

        // Compare hashed passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({'message': 'Invalid credentials'});
        }

        if (!user.emailVerified) {
            return res.status(401).json({'message': 'Please Verify Your Email First!'});
        }

        res.cookie('accountToken', user.accountToken, { maxAge: 86400000 }) // 1 Day Cookie
        res.json({ 'message': 'Logged In Successfully!'})
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({'message': 'Internal Server Error'});
    }
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({'message': 'User not found'});
        }

        // Generate password reset token
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        // Send password reset email
        const mailOptions = {
            to: email,
            subject: 'Password Reset',
            text: `You are receiving this email because you (or someone else) have requested to reset the password for your account.\n\n`
                + `Please click on the following link, or paste it into your browser to complete the process:\n\n`
                + `http://${req.headers.host}/reset-password/${token}\n\n`
                + `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).json({'message': 'Failed to send password reset email'});
            }
            console.log('Password reset email sent:', info.response);
            res.json({'message': 'Password reset email sent successfully'});
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({'message': 'Internal Server Error'});
    }
});

app.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Find user by token
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired');
        }

        // Render password reset form
        let file = fs.readFileSync('./public/html/reset-password.html', {encoding: 'utf-8'})
        file = file
        .replaceAll('$$token$$', token)
        res.send(file);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Find user by token
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({'message': 'Password reset token is invalid or has expired'});
        }

        // Update user's password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ 'message': 'Password has been reset, redirecting to login page....' })
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({'message': 'Internal Server Error' });
    }
});

// Start server
const PORT = jsonConfig['serverport'] || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
