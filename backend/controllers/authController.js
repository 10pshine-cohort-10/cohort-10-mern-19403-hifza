const bcrypt = require('bcrypt');
const db = require('../config/db.js');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const logger = require('../logger');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS

    }
});

const sendEmailOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Verification OTP!',
        text: `Welcome to Notes App! Your OTP is: ${otp}, It expires in 10 mins.`
    };

    await transporter.sendMail(mailOptions);
    logger.info("Email Send Successfully!");

};

exports.register = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        const [rows] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);

        if (rows.length > 0) {
            if (rows[0].email === email) {
                return res.status(400).json({ error: `this ${email} is Already Registered` });
            }
            else if (rows[0].username === username) {
                return res.status(400).json({ error: `this ${username} is Already Registered` });
            } else {
                return res.status(400).json({ error: `this ${email} is Already Registered` });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hash_pass = await bcrypt.hash(password, salt);

        const [userResult] = await db.query('INSERT INTO users (name, username, pass_hash, email ) VALUES (?,?,?,?);', [name, username, hash_pass, email]);

        const userID = userResult.insertId;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60000);
        const mysqlexpiry = expiry.toISOString().slice(0, 19).replace('T', ' ');

        await db.query('INSERT INTO otp (user_id, otp_code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE));', [userID, otp]);

        await sendEmailOTP(email, otp);

        res.status(201).json({ message: "User Registered. Check your email for the OTP.", name: name, username: username, email: email });

    } catch (err) {
        logger.error("Error: ", err.message);
        res.status(500).json({ Error: "Server Error" });
    }

};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email])
        if (user.length === 0) {
            logger.warn(`OTP verification failed: Email ${email} not found`);
            return res.status(404).json({ Error: "The email is not Registered" });
        }

        const [db_otp] = await db.query('SELECT * FROM otp WHERE user_id = ? AND otp_code = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1;', [user[0].id, otp]);
        if (db_otp.length === 0) {
            logger.warn(`Invalid or expired OTP attempt for ${email}`);
            return res.status(404).json({ Error: "The OTP doesn't match!" });
        }

        const dbExpiryDate = new Date(db_otp[0].expires_at + 'Z')

        const now = new Date();
        if (dbExpiryDate < now) {
            logger.warn(`Invalid or expired OTP attempt for ${email}`);
            return res.status(404).json({ Error: "OTP Expires" });
        }

        

        await db.query("UPDATE users SET is_verified = True WHERE email = ?;", [email]);
        await db.query('DELETE FROM otp Where user_id = ?', [user[0].id]);
        logger.info(`Email verified successfully for ${email}`);
        return res.status(201).json({ Message: 'OTP verified Successfully!' })


    } catch (err) {
        logger.error(`OTP verification error: ${err.message}`);
        return res.status(500).json({ Error: "OTP verification Failed!" })
    }

};

exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            logger.warn(`Resend OTP requested for non-existent email: ${email}`);
            return res.status(404).json({ error: "User not found" });
        }


        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await db.query(
            'INSERT INTO otp (user_id, otp_code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
            [user[0].id, otp]
        );

        await sendEmailOTP(email, otp);

        logger.info(`OTP resent to ${email}`);

        res.status(200).json({ message: "A new OTP has been sent to your email." });

    } catch (err) {
        logger.error("Error: ", err.message);
        res.status(500).json({ error: "Server Error" });

    }
}

exports.Login = async (req, res)=>{
    try{
        const {email, pass} = req.body;

        const [user] = await db.query("SELECT * FROM users WHERE email = ?", [email])

        if (user.length === 0){
            logger.warn(`Failed login attempt: Email ${email} not found`);
            return res.status(401).json({Error: email + "Email not Registered!"});
        }

        if(user[0].is_verified === 0){
            logger.warn(`Failed login attempt: Incorrect password for ${email}`);
            return res.status(403).json({Error: "Please Verify Your Email First."})
        }
        const is_match = await bcrypt.compare(pass, user[0].pass_hash);

        if (!is_match){
            logger.warn(`Failed login attempt: Incorrect password for ${email}`);
            return res.status(401).json({Error: "Invalid Email or Password."});
        }

        const token = jwt.sign(
            {
            id: user[0].id, 
            email: user[0].email,
            iat: Math.floor(Date.now() / 1000)
            },
            process.env.JWT_SECRET,
            {expiresIn :  '1d'}
        );

        logger.info(`User logged in successfully: ${email}`);

        return res.status(200).json({
            Message: "Login Successfully!",
            token : token,
            user: {
                email: email,
                username: user[0].username,
                id: user[0].id,
                name: user[0].name
            }
        });

    }catch(err){
        logger.error("Error:", err.message);
        res.status(500).json({Error: "Login Failed!"})

    }

};

exports.getProfile = async (req, res) => {
    try{
        const userId = req.user.id;

        const [user] = await db.query("SELECT id, username, name, email, DATE_FORMAT(created_at, '%Y-%m-%d %h:%i %p') As created_at FROM users WHERE id = ?;", [userId]);

        if(user.length === 0){
            logger.warn(`Profile fetch failed: User ID ${userId} not found`);
            return res.status(404).json({Error: "User doesn't Exist."});
        }

        return res.status(200).json(user[0]);

    }catch(err){
        logger.error(`Profile fetch error for User ID ${req.user.id}: ${err.message}`);
        return res.status(500).json({Error: "Unable to get profile information."})
    }

};