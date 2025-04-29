import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import EmergencyContacts from '../components/emergency/EmergencyContacts';
import SOSButton from '../components/emergency/SOSButton';
import HelpCenters from '../components/emergency/HelpCenters';


const EmergencyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-red-600 mb-8">Emergency Services</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 md:col-span-2">
          <SOSButton />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <EmergencyContacts />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <HelpCenters />
        </div>

        
      </div>
    </div>
  );
};

export default EmergencyPage; 