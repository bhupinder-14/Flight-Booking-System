const { TicketRepository } = require("../repositories");
const { MAILER } = require("../config");

const ticketRepo = new TicketRepository();

async function sendEmail(mailFrom, data) {
  try {
    const { recepientEmail, subject, text, flightData, bookingDetails } = data;

    // Create a well-formatted HTML email content
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c5282; text-align: center;">✈️ Flight Booking Confirmation</h2>
            
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d3748; margin-top: 0;">Booking Details</h3>
              <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
              <p><strong>Number of Seats:</strong> ${
                bookingDetails.noofSeats
              }</p>
              <p><strong>Total Cost:</strong> ₹${bookingDetails.totalCost}</p>
              <p><strong>User ID:</strong> ${bookingDetails.userId}</p>
            </div>
            
            <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d3748; margin-top: 0;">Flight Information</h3>
              <p><strong>Flight Number:</strong> ${flightData.flightNumber}</p>
              <p><strong>Flight ID:</strong> ${flightData.flightId}</p>
              <p><strong>Route:</strong> ${flightData.departure} → ${
      flightData.arrival
    }</p>
              <p><strong>Departure:</strong> ${new Date(
                flightData.departureTime
              ).toLocaleString()}</p>
              <p><strong>Arrival:</strong> ${new Date(
                flightData.arrivalTime
              ).toLocaleString()}</p>
              <p><strong>Price per Seat:</strong> ₹${flightData.price}</p>
              <p><strong>Airline ID:</strong> ${flightData.airline}</p>
            </div>
            
            <div style="background-color: #f0fff4; padding: 15px; border-radius: 8px; border-left: 4px solid #48bb78;">
              <p style="margin: 0; color: #2f855a;"><strong>Status:</strong> Booking Confirmed Successfully! ✅</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #718096;">
              <p>Thank you for choosing our service!</p>
              <p>Have a safe and pleasant journey!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create a plain text version as fallback
    const textContent = `
Flight Booking Confirmation

Booking Details:
- Number of Seats: ${bookingDetails.noofSeats}
- Total Cost: ₹${bookingDetails.totalCost}

Flight Information:
- Flight Number: ${flightData.flightNumber}
- Route: ${flightData.departure} → ${flightData.arrival}
- Departure: ${new Date(flightData.departureTime).toLocaleString()}
- Arrival: ${new Date(flightData.arrivalTime).toLocaleString()}
- Price per Seat: ₹${flightData.price}

Status: Booking Confirmed Successfully!

Thank you for choosing our service!
Have a safe and pleasant journey!
    `;

    const response = await MAILER.sendMail({
      from: mailFrom,
      to: recepientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function createTicket(data) {
  try {
    const response = await ticketRepo.create(data);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getPendingEmails() {
  try {
    const response = await ticketRepo.getPendingTickets();
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  sendEmail,
  createTicket,
  getPendingEmails,
};
