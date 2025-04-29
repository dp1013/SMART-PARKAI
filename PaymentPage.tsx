import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save booking details
      const existingBookings = JSON.parse(localStorage.getItem('parkingBookings') || '[]');
      const updatedBooking = {
        ...booking,
        paymentStatus: 'completed',
        paymentDate: new Date().toISOString()
      };
      
      localStorage.setItem('parkingBookings', JSON.stringify([...existingBookings, updatedBooking]));
      
      // Navigate to success page
      navigate('/payment-success', { state: { booking: updatedBooking } });
    } catch (error) {
      console.error('Payment failed:', error);
      navigate('/payment-failure');
    }
  };

  if (!booking) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f6f9fc] flex flex-col items-center justify-center p-4">
      <div className="max-w-[450px] w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm text-gray-600">smart park</div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-[#635bff]">buy.stripe.com</div>
            <div className="text-sm text-gray-600">Use your domain →</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Amount Display */}
          <div className="mb-8">
            <h1 className="text-xl font-medium text-gray-900">Pay smart park</h1>
            <div className="text-3xl font-medium mt-1">₹{booking.price}.00</div>
          </div>

          {/* Product Details */}
          <div className="border-t border-gray-200 -mx-8 px-8 py-4 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Product name</span>
              <span className="text-gray-900">₹{booking.price}.00</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">₹{booking.price}.00</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-600">Enter address to calculate</span>
            </div>
            <div className="flex justify-between text-sm font-medium mt-4 pt-4 border-t border-gray-200">
              <span>Total due</span>
              <span>₹{booking.price}.00</span>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-[#635bff] focus:border-[#635bff]"
                  required
                  placeholder="you@example.com"
                />
              </div>

              {/* Card Information */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Card information</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 1234 1234 1234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-t-md shadow-sm focus:ring-1 focus:ring-[#635bff] focus:border-[#635bff]"
                    required
                    aria-label="Card number"
                    id="cardNumber"
                  />
                </div>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="w-1/2 px-3 py-2 border-l border-r border-b border-gray-300 focus:ring-1 focus:ring-[#635bff] focus:border-[#635bff]"
                    required
                    aria-label="Card expiry date"
                    id="cardExpiry"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-1/2 px-3 py-2 border-r border-b border-gray-300 rounded-br-md focus:ring-1 focus:ring-[#635bff] focus:border-[#635bff]"
                    required
                    aria-label="Card security code"
                    id="cardCvc"
                  />
                </div>
              </div>

              {/* Name on Card */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name on card</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-[#635bff] focus:border-[#635bff]"
                  required
                />
              </div>

              {/* Billing Address */}
              <div>
                <label htmlFor="country" className="block text-sm text-gray-700 mb-1">Billing address</label>
                <select 
                  id="country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-[#635bff] focus:border-[#635bff] mb-2"
                  aria-label="Country selection"
                >
                  <option>India</option>
                </select>
                <input
                  type="text"
                  id="address1"
                  placeholder="Address line 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-[#635bff] focus:border-[#635bff] mb-2"
                  required
                  aria-label="Address line 1"
                />
                <input
                  type="text"
                  placeholder="Address line 2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-[#635bff] focus:border-[#635bff] mb-2"
                />
                <div className="grid grid-cols-6 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-[#635bff] focus:border-[#635bff]"
                    required
                  />
                  <select 
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-[#635bff] focus:border-[#635bff] mb-2"
                    required
                    aria-label="State selection"
                    id="state"
                  >
                    <option value="">State</option>
                    <option>Maharashtra</option>
                  </select>
                  <input
                    type="text"
                    placeholder="ZIP"
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-[#635bff] focus:border-[#635bff]"
                    required
                  />
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#635bff] text-white py-2 px-4 rounded-md hover:bg-[#5851e9] transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Pay'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Powered by</span>
              <svg className="h-5" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M59.64 14.28h-8.06v2.58h8.06v-2.58zM59.64 8.28h-8.06v2.58h8.06v-2.58z" fill="#635BFF"/>
                <path d="M52.64 11.28c0-1.1.9-2 2-2h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-2z" fill="#635BFF"/>
              </svg>
            </div>
            <div className="mt-2 flex justify-center space-x-4 text-sm">
              <span className="text-gray-500">Terms</span>
              <span className="text-gray-500">Privacy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;