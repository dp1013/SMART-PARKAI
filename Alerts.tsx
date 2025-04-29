import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface Alert {
  id: number;
  plateNumber: string;
  timestamp: string;
  message: string;
  wasFined: boolean;
}

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockAlerts: Alert[] = [
      {
        id: 1,
        plateNumber: 'MH01AB1234',
        timestamp: '2024-04-15T10:30:00Z',
        message: 'Vehicle parked in no-parking zone',
        wasFined: true
      },
      {
        id: 2,
        plateNumber: 'MH02CD5678',
        timestamp: '2024-04-15T11:15:00Z',
        message: 'Vehicle parked in no-parking zone',
        wasFined: false
      }
    ];

    setAlerts(mockAlerts);
    setLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Parking Violations</h1>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <span className="text-sm text-gray-600">Active Alerts</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plate Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {alert.plateNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {formatDate(alert.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {alert.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {alert.wasFined ? (
                          <div className="flex items-center text-red-600">
                            <XCircle className="h-5 w-5 mr-2" />
                            <span className="text-sm font-medium">Fined</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            <span className="text-sm font-medium">Warning</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts; 