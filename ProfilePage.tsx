import React, { useState, useEffect, CSSProperties } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Calendar, Clock, Car, MapPin, History, Clock3, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';
import UIChangeTracker from '../components/UIChangeTracker';

interface CarDetails {
  name: string;
  model: string;
  licensePlate: string;
  color: string;
}

interface AddressDetails {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface BookingDetails {
  id: string;
  date: string;
  amount: string;
  parkingSlot: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditingCar, setIsEditingCar] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [carDetails, setCarDetails] = useState<CarDetails>(() => {
    const saved = localStorage.getItem('carDetails');
    return saved ? JSON.parse(saved) : {
      name: '',
      model: '',
      licensePlate: '',
      color: ''
    };
  });

  const [addressDetails, setAddressDetails] = useState<AddressDetails>(() => {
    const saved = localStorage.getItem('addressDetails');
    return saved ? JSON.parse(saved) : {
      street: '',
      city: '',
      state: '',
      pincode: ''
    };
  });

  const [bookings, setBookings] = useState<BookingDetails[]>(() => {
    const saved = localStorage.getItem('bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const handleCarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('carDetails', JSON.stringify(carDetails));
    setIsEditingCar(false);
    toast.success('Car details updated successfully!');
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('addressDetails', JSON.stringify(addressDetails));
    setIsEditingAddress(false);
    toast.success('Address details updated successfully!');
  };

  const currentBookings = bookings.filter(booking => booking.status === 'upcoming');
  const bookingHistory = bookings.filter(booking => booking.status !== 'upcoming');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Car Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Car Details</h2>
            </div>
            <button
              onClick={() => setIsEditingCar(!isEditingCar)}
              className="text-blue-500 hover:text-blue-600"
              aria-label="Edit car details"
            >
              <Edit2 className="h-5 w-5" />
            </button>
          </div>
          
          {isEditingCar ? (
            <form onSubmit={handleCarSubmit} className="space-y-4">
              <div>
                <label htmlFor="carName" className="block text-sm text-gray-600 mb-1">Car Name</label>
                <input
                  id="carName"
                  type="text"
                  value={carDetails.name}
                  onChange={e => setCarDetails({...carDetails, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  placeholder="Give your car a name"
                />
              </div>
              <div>
                <label htmlFor="model" className="block text-sm text-gray-600 mb-1">Car Model</label>
                <input
                  id="model"
                  type="text"
                  value={carDetails.model}
                  onChange={e => setCarDetails({...carDetails, model: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  placeholder="Enter car model"
                />
              </div>
              <div>
                <label htmlFor="licensePlate" className="block text-sm text-gray-600 mb-1">License Plate</label>
                <input
                  id="licensePlate"
                  type="text"
                  value={carDetails.licensePlate}
                  onChange={e => setCarDetails({...carDetails, licensePlate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  placeholder="XX-XX-XX-XXXX"
                />
              </div>
              <div>
                <label htmlFor="color" className="block text-sm text-gray-600 mb-1">Color</label>
                <input
                  id="color"
                  type="text"
                  value={carDetails.color}
                  onChange={e => setCarDetails({...carDetails, color: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  placeholder="Enter car color"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Save Car Details
              </button>
            </form>
          ) : (
            <div className="space-y-2">
              <p><span className="text-gray-600">Name:</span> {carDetails.name || 'Not set'}</p>
              <p><span className="text-gray-600">Model:</span> {carDetails.model || 'Not set'}</p>
              <p><span className="text-gray-600">License Plate:</span> {carDetails.licensePlate || 'Not set'}</p>
              <p><span className="text-gray-600">Color:</span> {carDetails.color || 'Not set'}</p>
            </div>
          )}
        </div>

        {/* Address Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Address Details</h2>
            </div>
            <button
              onClick={() => setIsEditingAddress(!isEditingAddress)}
              className="text-blue-500 hover:text-blue-600"
              aria-label="Edit address details"
            >
              <Edit2 className="h-5 w-5" />
            </button>
          </div>
          
          {isEditingAddress ? (
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label htmlFor="street" className="block text-sm text-gray-600 mb-1">Street Address</label>
                <input
                  id="street"
                  type="text"
                  value={addressDetails.street}
                  onChange={e => setAddressDetails({...addressDetails, street: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  placeholder="Enter street address"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm text-gray-600 mb-1">City</label>
                <input
                  id="city"
                  type="text"
                  value={addressDetails.city}
                  onChange={e => setAddressDetails({...addressDetails, city: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  placeholder="Enter city name"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm text-gray-600 mb-1">State</label>
                <select
                  id="state"
                  value={addressDetails.state}
                  onChange={e => setAddressDetails({...addressDetails, state: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  aria-label="State"
                >
                  <option value="">Select State</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={addressDetails.pincode}
                  onChange={e => setAddressDetails({...addressDetails, pincode: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  pattern="[0-9]{6}"
                  placeholder="6-digit PIN code"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Save Address
              </button>
            </form>
          ) : (
            <div className="space-y-2">
              <p><span className="text-gray-600">Street:</span> {addressDetails.street || 'Not set'}</p>
              <p><span className="text-gray-600">City:</span> {addressDetails.city || 'Not set'}</p>
              <p><span className="text-gray-600">State:</span> {addressDetails.state || 'Not set'}</p>
              <p><span className="text-gray-600">PIN Code:</span> {addressDetails.pincode || 'Not set'}</p>
            </div>
          )}
        </div>

        {/* Current Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock3 className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Current Bookings</h2>
          </div>
          <div className="space-y-4">
            {currentBookings.length > 0 ? (
              currentBookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Booking ID: {booking.id}</p>
                      <p className="text-gray-600">Date: {new Date(booking.date).toLocaleDateString('en-IN')}</p>
                      <p className="text-gray-600">Duration: {booking.duration}</p>
                      <p className="text-gray-600">Spot: {booking.parkingSlot}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">{booking.amount}</p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Upcoming
                      </span>
                      <button
                        onClick={() => {
                          const updatedBookings = bookings.map(b => 
                            b.id === booking.id ? {...b, status: 'cancelled'} : b
                          );
                          setBookings(updatedBookings);
                          localStorage.setItem('bookings', JSON.stringify(updatedBookings));
                          toast.success('Booking cancelled successfully');
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No current bookings</p>
            )}
          </div>
        </div>

        {/* Booking History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <History className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Booking History</h2>
          </div>
          <div className="space-y-4">
            {bookingHistory.length > 0 ? (
              bookingHistory.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Booking ID: {booking.id}</p>
                      <p className="text-gray-600">Date: {new Date(booking.date).toLocaleDateString('en-IN')}</p>
                      <p className="text-gray-600">Duration: {booking.duration}</p>
                      <p className="text-gray-600">Spot: {booking.parkingSlot}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">{booking.amount}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        booking.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No booking history</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;