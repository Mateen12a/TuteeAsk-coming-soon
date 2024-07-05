const express = require("express");
const ejs = require("ejs");
const path = require("path");
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

const port = 3000;
const nodeMailerUser = process.env.nodeMailerUser; 
const nodeMailerPass = process.env.nodeMailerPass; 



const Subscriber = require('./models/subscriber'); 


app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
// MongoDB Connection URI (replace placeholders with your actual values)
const uri = process.env.MONGODB_URI;
app.use(express.static(path.join(__dirname, "public")));
// Connect to MongoDB using Mongoose
mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB using Mongoose!');

    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  })
  .catch(err => {
    if (err.name === 'MongoServerError') {
      if (err.code === 11000) {
        console.error('Duplicate key error:', err.message); // Duplicate email
      } else if (err.code === undefined && err.reason && err.reason.type === 'ReplicaSetNoPrimary') {
          console.error('No primary server found in replica set. Check MongoDB Atlas status.');
      }
      else{
        console.error('Other MongoDB error:', err.message); 
      }
    } else {
      console.error('Connection error:', err.message); 
    }
    });


  
app.set("views", path.join(__dirname, "/src/views"));
app.set("view engine", "ejs");

app.get('*', (req, res) => {
    res.render('coming-soon');
  });
app.post('/', async (req, res) => {
    if (!req.body.email) {
        // Return a message to the frontend or render an error template
        return res.json({success: false, error: "Email is required" })
    }
    const email = req.body.email;
  
    try {
    const existingSubscriber = await Subscriber.find({ email }).count();
    if (existingSubscriber > 0) {
        return res.status(400).json({ success: false, error: 'Email already subscribed.' });
    }
      // Create a new subscriber instance using the model
      const subscriber = new Subscriber({ email });
      await subscriber.save(); // Save the subscriber to MongoDB
    } catch (error) {
      if (error.name === 'MongoServerError' && error.code === 11000) { // MongoDB duplicate key error
          // Handle duplicate email error (optional - show error message)
      } else {
          console.error('Error saving email:', error);
      }
    }
    // 2. Send confirmation email
    
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtppro.zoho.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: nodeMailerUser,
            pass: nodeMailerPass
        }// ... (zoho email service provider configuration)
      });
      
      transporter.sendMail({
        from: 'hello@tuteeask.com', 
        to: 'hello@tuteeask.com', 
        subject: 'New Subscriber!',
        text: `New user subscribed with email: ${email}`
        });

      const info = transporter.sendMail({
        from: 'hello@tuteeask.com', 
        to: email,
        subject: 'Thanks for subscribing to TuteeAsk!',
        html: `<!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            color: #000000;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            background-color: #FFFFFF;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 30px;
                            border-radius: 8px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #59CBAC; 
                            text-align: center;
                        }
                        p {
                            line-height: 1.6;
                        }
                        .logo {
                            max-width: 200px;
                            margin: 20px auto;
                            display: block;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <img class="logo" src="https://tuteeask.com/images/logo.svg" alt="Tutee Ask Logo">
                        <h1>Thank you for subscribing!</h1>
                        <p>You're now on the list to be notified when TuteeAsk launches. Get ready to ask, learn, and grow!</p>
                    </div>
                </body>
            </html>
                    ` // Include the HTML email template here
                    
    }).then(() => {
        // Respond with success message (for AJAX) AFTER email is sent
        res.json({ success: true });
      }).catch(err => {
        console.error("Error sending email:", err); // Log the complete error object for debugging
        // Only send an error response, do not redirect
        res.status(500).json({ success: false, error: err.message || 'An error occurred while sending the email.' });
      });
  } catch (error) {
      console.error("Error in POST route:", error); 
      res.status(500).json({ success: false, error: error.message || 'An error occurred.' });
  }
    
});