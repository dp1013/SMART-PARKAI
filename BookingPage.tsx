import React, { useState, useEffect } from 'react';
import { Clock, CreditCard, Mic, MicOff, MapPin, Car } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { format, addHours, addMinutes } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe('pk_test_51RFv9xCi3QbWwBxSKPiCKjxjCCKiCcNeeG5Wdh3gGDIvfo0DYlL3YF2On4knMdlbCEyHt1LePhsReniKBQU30qnf000bILde3N');

const parkingDurations = [
  { value: '10', label: '10 minutes', multiplier: 0.2 },
  { value: '30', label: '30 minutes', multiplier: 0.5 },
  { value: '60', label: '1 hour', multiplier: 1.0 },
  { value: '120', label: '2 hours', multiplier: 2.0 },
  { value: '180', label: '3 hours', multiplier: 3.0 }
];

const parkingPreferences = [
  {
    id: 'exit',
    name: 'Near Exit',
    slot: 'P1',
    description: 'Quick access to street level, perfect for short stays',
    features: ['Direct exit access', '2-minute walk to street', 'Well-lit pathway']
  },
  {
    id: 'ev',
    name: 'EV Charging Zone',
    slot: 'P2',
    description: 'Dedicated area with EV charging stations',
    features: ['Multiple charging points', '24/7 charging access', 'Technical support']
  },
  {
    id: 'elevator',
    name: 'Near Elevator',
    slot: 'P3',
    description: 'Convenient for carrying shopping or luggage',
    features: ['Multiple elevators', 'Shopping cart access', 'Luggage friendly']
  }
];

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const Booking = () => {
  const [selectedDuration, setSelectedDuration] = useState('60');
  const [customDuration, setCustomDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('city');
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [answers, setAnswers] = useState({
    assistance: 'no'
  });

  // Add this useEffect for AI recommendation
  useEffect(() => {
    const locations = {
      city: 'City Center Parking',
      mall: 'Mall Parking Complex', 
      airport: 'Airport Parking'
    };
    
    const recommendations = {
      city: 'AI recommends P8',
      mall: 'AI recommends P20', 
      airport: 'AI recommends P3'
    };
    
    setAiRecommendation(recommendations[selectedLocation as keyof typeof recommendations]);
  }, [selectedLocation]);

  const basePrice = 200;
  const navigate = useNavigate();

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setCustomDuration(value);
      if (value) {
        const minutes = Math.min(Math.max(parseInt(value), 10), 180);
        const closest = parkingDurations.reduce((prev, curr) => {
          return Math.abs(parseInt(curr.value) - minutes) < Math.abs(parseInt(prev.value) - minutes) ? curr : prev;
        });
        setSelectedDuration(closest.value);
      }
    }
  };

  const getStartTime = () => {
    return addHours(new Date(), 1);
  };

  const calculateEndTime = () => {
    return addMinutes(getStartTime(), parseInt(selectedDuration));
  };

  const calculatePrice = () => {
    const durationMultiplier = parkingDurations.find(d => d.value === selectedDuration)?.multiplier || 1;
    const valetSurcharge = answers.assistance === 'yes' ? 100 : 0;
    
    let finalPrice = basePrice * durationMultiplier;
    finalPrice += valetSurcharge;
    
    if (discountApplied) {
      finalPrice *= 0.9;
    }
    
    return Math.round(finalPrice);
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'first10') {
      setDiscountApplied(true);
      setFeedback('Promo code applied successfully! 10% discount added.');
    } else {
      setFeedback('Invalid promo code. Try "FIRST10" for 10% off.');
    }
  };

  const handlePayment = async () => {
    if (!selectedPreference) {
      setFeedback('Please select your parking preference');
      return;
    }

    setLoading(true);
    try {
      // Create booking object
      const bookingDetails = {
        spotId: selectedPreference,
        location: parkingPreferences.find(p => p.id === selectedPreference)?.name || '',
        duration: parseInt(customDuration),
        price: calculatePrice(),
        startTime: getStartTime().toISOString(),
        endTime: calculateEndTime().toISOString(),
        hasValet: answers.assistance === 'yes',
        status: 'pending'
      };

      // Navigate to payment page with booking details
      navigate('/payment', { state: { booking: bookingDetails } });
    } catch (error) {
      console.error('Booking failed:', error);
      setFeedback('Failed to process booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    let understood = false;
    setFeedback('');

    if (lowerText.includes('minute') || lowerText.includes('hour')) {
      const minutesMatch = lowerText.match(/(\d+)\s*minute/);
      const hoursMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*hour/);
      
      let minutes = 0;
      if (minutesMatch) minutes = parseInt(minutesMatch[1]);
      if (hoursMatch) minutes = Math.round(parseFloat(hoursMatch[1]) * 60);
      
      if (minutes > 0) {
        minutes = Math.min(Math.max(minutes, 10), 180);
        const closest = parkingDurations.reduce((prev, curr) => {
          return Math.abs(parseInt(curr.value) - minutes) < Math.abs(parseInt(prev.value) - minutes) ? curr : prev;
        });
        
        setSelectedDuration(closest.value);
        setCustomDuration(closest.value);
        setFeedback(`Set duration to ${closest.label}`);
        understood = true;
      }
    }

    if (lowerText.includes('exit') || lowerText.includes('quick')) {
      setSelectedPreference('exit');
      understood = true;
    } else if (lowerText.includes('ev') || lowerText.includes('charging')) {
      setSelectedPreference('ev');
      understood = true;
    } else if (lowerText.includes('elevator') || lowerText.includes('lift')) {
      setSelectedPreference('elevator');
      understood = true;
    }

    if (lowerText.includes('valet')) {
      setAnswers(prev => ({ ...prev, assistance: lowerText.includes('no valet') ? 'no' : 'yes' }));
      understood = true;
    }

    if (!understood) {
      setFeedback("Try saying something like '30 minutes near exit' or '2 hours with EV charging'");
    }
  };

  const startListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in your browser.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('Listening...');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processVoiceCommand(text);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setFeedback(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setFeedback('Failed to start speech recognition. Please try again.');
      setIsListening(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Book a Parking Slot</h1>

      {/* Add Location Selection */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Select Location
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedLocation('city')}
            className={`p-3 rounded-lg border transition ${
              selectedLocation === 'city' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            City Center
          </button>
          <button
            onClick={() => setSelectedLocation('mall')}
            className={`p-3 rounded-lg border transition ${
              selectedLocation === 'mall' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            Mall Parking
          </button>
          <button
            onClick={() => setSelectedLocation('airport')}
            className={`p-3 rounded-lg border transition ${
              selectedLocation === 'airport' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            Airport
          </button>
        </div>
      </div>

      {/* Add AI Recommendation */}
      {aiRecommendation && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">AI Recommendation</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>{aiRecommendation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => isListening ? setIsListening(false) : startListening()}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          <span>{isListening ? 'Stop Listening' : 'Start Voice Assistant'}</span>
        </button>
        {(transcript || feedback) && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
            {transcript && <p className="text-sm text-gray-600">I heard: {transcript}</p>}
            {feedback && <p className="text-sm text-blue-600">{feedback}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5" />
                <span>What's your parking preference?</span>
              </div>
            </label>
            <div className="space-y-3">
              {parkingPreferences.map(pref => (
                <button
                  key={pref.id}
                  onClick={() => setSelectedPreference(pref.id)}
                  className={`w-full p-4 rounded-lg border transition ${
                    selectedPreference === pref.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="font-semibold">{pref.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{pref.description}</p>
                    <ul className="mt-2 text-sm text-gray-600">
                      {pref.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <span>• {feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Duration (10 mins - 3 hours)</span>
              </div>
            </label>
            <div className="mb-4">
              <input
                type="text"
                value={customDuration}
                onChange={handleCustomDurationChange}
                placeholder="Enter duration in minutes (10-180)"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Or choose from preset durations:</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {parkingDurations.map(duration => (
                <button
                  key={duration.value}
                  onClick={() => {
                    setSelectedDuration(duration.value);
                    setCustomDuration(duration.value);
                  }}
                  className={`p-3 rounded-lg border transition ${
                    selectedDuration === duration.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                Starts at: {format(getStartTime(), 'h:mm a')}
              </p>
              <p className="text-sm text-gray-600">
                Ends at: {format(calculateEndTime(), 'h:mm a')}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Do you need valet service?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAnswers(prev => ({ ...prev, assistance: 'yes' }))}
                className={`p-3 rounded-lg border transition ${
                  answers.assistance === 'yes'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                Yes (+₹100)
              </button>
              <button
                onClick={() => setAnswers(prev => ({ ...prev, assistance: 'no' }))}
                className={`p-3 rounded-lg border transition ${
                  answers.assistance === 'no'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Promo Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={applyPromoCode}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Pricing Summary</h3>
            <div className="space-y-2">
              <p>Base Rate: {formatINR(basePrice)}/hour</p>
              <p>Duration: {parkingDurations.find(d => d.value === selectedDuration)?.label}</p>
              {selectedPreference && (
                <p>Location: {parkingPreferences.find(p => p.id === selectedPreference)?.name}</p>
              )}
              {answers.assistance === 'yes' && (
                <p>Valet Service: +₹100</p>
              )}
              {discountApplied && <p className="text-green-600">Promo Code Discount: -10%</p>}
              <p className="text-xl font-bold">Total: {formatINR(calculatePrice())}</p>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading || !selectedPreference}
            className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <CreditCard className="h-5 w-5" />
            <span>{loading ? 'Processing...' : 'Pay Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Booking;