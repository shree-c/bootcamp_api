const nodemailer = require("nodemailer");

const sendEmail = async function (options) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
    });
    // send mail with defined transport object
    const message = {
        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM}>`,
        to: options.to, // list of receivers
        subject: options.subject, // Subject line
        text: options.text, // plain text body
    };
    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;