import React, { useState } from 'react';
import { Calendar, Clock, Car, TrendingUp, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for demonstration
const mockHistory = [
  {
    id: 1,
    date: '2024-03-10',
    duration: 2,
    vehicleType: 'car',
    level: 'P1',
    amount: 400,
    licensePlate: 'MH-01-AB-1234'
  },
  {
    id: 2,
    date: '2024-03-08',
    duration: 4,
    vehicleType: 'suv',
    level: 'P2',
    amount: 720,
    licensePlate: 'MH-01-AB-1234'
  },
  {
    id: 3,
    date: '2024-03-05',
    duration: 1,
    vehicleType: 'motorcycle',
    level: 'P3',
    amount: 70,
    licensePlate: 'MH-01-CD-5678'
  }
];

const ParkingHistory = () => {
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [sortBy, setSortBy] = useState('date');

  const totalSpent = mockHistory.reduce((sum, booking) => sum + booking.amount, 0);
  const averagePerVisit = totalSpent / mockHistory.length;
  const mostVisitedLevel = 'P1';
  const frequentVehicle = 'Car';

  const downloadHistory = () => {
    const csvContent = [
      ['Date', 'Duration (hours)', 'Vehicle Type', 'Level', 'Amount (₹)', 'License Plate'],
      ...mockHistory.map(booking => [
        format(new Date(booking.date), 'dd/MM/yyyy'),
        booking.duration,
        booking.vehicleType,
        booking.level,
        booking.amount,
        booking.licensePlate
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parking-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Total Spent</h3>
          <p className="text-2xl font-bold">₹{totalSpent}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Average per Visit</h3>
          <p className="text-2xl font-bold">₹{Math.round(averagePerVisit)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Most Visited Level</h3>
          <p className="text-2xl font-bold">{mostVisitedLevel}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Frequent Vehicle</h3>
          <p className="text-2xl font-bold">{frequentVehicle}</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Month</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="border rounded px-3 py-1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>
          <button
            onClick={downloadHistory}
            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Booking History Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockHistory.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(booking.date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.duration} {booking.duration === 1 ? 'hour' : 'hours'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {booking.vehicleType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ₹{booking.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.licensePlate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParkingHistory;