const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationOTP = async (email, otp, username) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email - Delivery App',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">Hello ${username}!</h2>
                <p>Thank you for registering with Delivery App.</p>
                <p>Your verification code is:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background-color: #f0f0f0; 
                                padding: 20px; 
                                border-radius: 10px; 
                                display: inline-block;">
                        <h1 style="color: #4CAF50; 
                                   font-size: 36px; 
                                   margin: 0; 
                                   letter-spacing: 10px;">${otp}</h1>
                    </div>
                </div>
                <p>Please enter this code in the app to verify your email.</p>
                <p style="color: #888; font-size: 12px;">This code will expire in 1 minutes.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification OTP sent successfully');
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
};

module.exports = { sendVerificationOTP };