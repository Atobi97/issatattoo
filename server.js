const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your.studio@gmail.com', // Replace with your Gmail address
        pass: 'your-app-specific-password' // Replace with your app-specific password
    }
});

// Email templates
const getCustomerEmailTemplate = (booking, language) => {
    const subject = language === 'hu' 
        ? 'Foglalás visszaigazolás - Issa Tattoo'
        : 'Booking Confirmation - Issa Tattoo';

    const body = language === 'hu'
        ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ff3366;">Issa Tattoo</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #333;">Kedves ${booking.name}!</h2>
                
                <p style="color: #666; line-height: 1.6;">
                    Köszönjük a foglalását. Az alábbi részletekkel rögzítettük:
                </p>

                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; color: #666;"><strong>Szolgáltatás:</strong></td>
                            <td style="padding: 10px 0; color: #333;">${booking.service === 'tattoo' ? 'Tetoválás' : 'Piercing'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;"><strong>Választott művész:</strong></td>
                            <td style="padding: 10px 0; color: #333;">${booking.artist}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;"><strong>Tervezett időpont:</strong></td>
                            <td style="padding: 10px 0; color: #333;">${new Date(booking.date).toLocaleDateString('hu-HU')}</td>
                        </tr>
                    </table>
                </div>

                <p style="color: #666; line-height: 1.6;">
                    Hamarosan kapcsolatba lépünk Önnel az időpont véglegesítése céljából.
                </p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; margin: 0;">Üdvözlettel,</p>
                    <p style="color: #333; font-weight: bold; margin: 5px 0;">Issa Tattoo csapata</p>
                </div>
            </div>
        </div>
        `
        : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ff3366;">Issa Tattoo</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #333;">Dear ${booking.name},</h2>
                
                <p style="color: #666; line-height: 1.6;">
                    Thank you for your booking. We have recorded the following details:
                </p>

                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; color: #666;"><strong>Service:</strong></td>
                            <td style="padding: 10px 0; color: #333;">${booking.service}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;"><strong>Preferred artist:</strong></td>
                            <td style="padding: 10px 0; color: #333;">${booking.artist}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;"><strong>Requested date:</strong></td>
                            <td style="padding: 10px 0; color: #333;">${new Date(booking.date).toLocaleDateString('en-US')}</td>
                        </tr>
                    </table>
                </div>

                <p style="color: #666; line-height: 1.6;">
                    We will contact you shortly to confirm your appointment.
                </p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; margin: 0;">Best regards,</p>
                    <p style="color: #333; font-weight: bold; margin: 5px 0;">Issa Tattoo Team</p>
                </div>
            </div>
        </div>
        `;

    return { subject, body };
};

const getStudioEmailTemplate = (booking) => {
    return {
        subject: 'New Booking Received',
        body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ff3366;">New Booking Received</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; color: #666;"><strong>Name:</strong></td>
                            <td style="padding: 10px 0; color: #333;">${booking.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;"><strong>Email:</strong></td>
                            <td style="padding: 10px 0; color: #333;">${booking.email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;"><strong>Phone:</strong></td>
                            <td style="padding: 10px 0; color: #333;">${booking.phone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;"><strong>Service:</strong></td>
                            <td style="padding: 10px 0; color: #333;">${booking.service}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;"><strong>Artist:</strong></td>
                            <td style="padding: 10px 0; color: #333;">${booking.artist}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;"><strong>Date:</strong></td>
                            <td style="padding: 10px 0; color: #333;">${new Date(booking.date).toLocaleDateString()}</td>
                        </tr>
                    </table>
                </div>

                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Description:</h3>
                    <p style="color: #666; line-height: 1.6; margin: 0;">${booking.description}</p>
                </div>
            </div>
        </div>
        `
    };
};

// Send email function
const sendEmails = async (booking) => {
    try {
        // Email to customer
        const customerEmail = getCustomerEmailTemplate(booking, booking.language);
        await transporter.sendMail({
            from: '"Issa Tattoo" <your.studio@gmail.com>',
            to: booking.email,
            subject: customerEmail.subject,
            html: customerEmail.body
        });

        // Email to studio
        const studioEmail = getStudioEmailTemplate(booking);
        await transporter.sendMail({
            from: '"Booking System" <your.studio@gmail.com>',
            to: 'your.studio@gmail.com',
            subject: studioEmail.subject,
            html: studioEmail.body
        });

        return true;
    } catch (error) {
        console.error('Error sending emails:', error);
        return false;
    }
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Ensure bookings.json exists
const bookingsFile = 'bookings.json';
if (!fs.existsSync(bookingsFile)) {
    fs.writeFileSync(bookingsFile, '[]');
}

// Routes
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...req.body
        };

        // Save booking to file
        const bookings = JSON.parse(fs.readFileSync(bookingsFile));
        bookings.push(booking);
        fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));

        // Send confirmation emails
        const emailsSent = await sendEmails(booking);

        res.status(201).json({
            success: true,
            message: req.body.language === 'hu' 
                ? 'Foglalás sikeresen elmentve! Visszaigazoló e-mailt küldtünk a megadott címre.'
                : 'Booking successfully saved! A confirmation email has been sent to your address.',
            emailSent: emailsSent
        });
    } catch (error) {
        console.error('Error processing booking:', error);
        res.status(500).json({
            success: false,
            message: req.body.language === 'hu'
                ? 'Hiba történt a foglalás mentése közben.'
                : 'Error saving the booking.',
            emailSent: false
        });
    }
});

// Get all bookings (you might want to add authentication later)
app.get('/api/bookings', (req, res) => {
    try {
        const bookings = JSON.parse(fs.readFileSync(bookingsFile));
        res.json(bookings);
    } catch (error) {
        console.error('Error reading bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error reading bookings'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 