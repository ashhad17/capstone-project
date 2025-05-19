

const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "mohammedashhad017@gmail.com",
    pass: "jomg frtt jcoh wwue",
  },
});

const sendOtp=async (email, otp) => {
  await transporter.sendMail({
    from: "WheelsTrust",
    to: email,
    subject: 'Your OTP for WheelTrust Login',
    html: `<p>Your OTP is: <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });
};
const sendMail = async (to, subject, html) => {
  return transporter.sendMail({ from: "WheelsTrust", to, subject, html });
};



const sign = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports ={sendMail,sign,sendOtp} 

