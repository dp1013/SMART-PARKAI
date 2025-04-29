import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, Car } from 'lucide-react';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  useEffect(() => {
    if (!booking) {
      navigate('/');
    } else {
      // Save booking to localStorage for ProfilePage
      const bookingDetails = {
        id: `BK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        date: booking.startTime,
        amount: `₹${booking.price}`,
        parkingSlot: booking.location,
        duration: `${booking.duration} minutes`,
        status: 'upcoming'
      };
      localStorage.setItem('latestBooking', JSON.stringify(bookingDetails));
    }
  }, [booking, navigate]);

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your parking spot has been booked successfully.</p>
        </div>

        <div className="space-y-6">
          <div className="border-t border-b border-gray-200 py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <Car className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">P8 is booked</p>
                  <p className="text-sm text-gray-600">{booking.location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Duration</p>
                  <p className="text-sm text-gray-600">{booking.duration} minutes</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Start Time</p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.startTime).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">₹{booking.price}</p>
            <p className="text-sm text-gray-600">Total Amount Paid</p>
          </div>

          <div className="flex flex-col space-y-3">
            <Link
              to="/profile"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center"
            >
              View My Bookings
            </Link>
            <Link
              to="/"
              className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-200 text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;