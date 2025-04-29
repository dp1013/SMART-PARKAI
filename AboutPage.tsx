import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Zap, Clock, Shield, Users, Award, ChevronDown, Sparkles, Building2, AlertTriangle, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import LeaderboardComponent from '../components/LeaderboardComponent';

const AboutPage = () => {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const features = [
    {
      icon: <Car className="w-8 h-8" />,
      title: "Smart Parking",
      description: "Our AI-powered system guides you to the perfect spot, every time.",
      color: "bg-blue-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Book your spot in seconds. Because life's too short for complicated parking.",
      color: "bg-yellow-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Dynamic Pricing",
      description: "Save money with our smart pricing system. The early bird gets the discount!",
      color: "bg-green-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Parking",
      description: "24/7 surveillance and smart security. Your car is in safe hands.",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Traffic Safety Quiz Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text text-center">
            Learn Traffic Safety
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quiz Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-2xl font-bold mb-4 text-center">Traffic Safety Quiz</h3>
              <p className="text-gray-600 mb-6 text-center">
                Test your knowledge of traffic rules and safety practices. Learn essential driving tips while having fun!
              </p>
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/traffic-safety')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-lg font-bold hover:opacity-90 transition-opacity inline-flex items-center space-x-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span>Take Quiz</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Road Sign Challenge Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-2xl font-bold mb-4 text-center">Road Sign Challenge</h3>
              <p className="text-gray-600 mb-6 text-center">
                Master traffic signs from different categories. Test your knowledge and improve your road safety awareness!
              </p>
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/road-signs')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-lg font-bold hover:opacity-90 transition-opacity inline-flex items-center space-x-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Start Challenge</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Leaderboards Section */}
      <div className="container mx-auto px-4 py-16 bg-white/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text text-center">
            Game Leaderboards
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-center text-blue-600">Traffic Safety Quiz</h3>
              <LeaderboardComponent gameType="traffic-safety" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-center text-purple-600">Road Sign Challenge</h3>
              <LeaderboardComponent gameType="road-signs" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hero Section with Site Info */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform -skew-y-6 origin-top-left"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative container mx-auto px-4 py-24 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
            onClick={() => setClickCount(prev => prev + 1)}
            className="cursor-pointer"
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <Building2 className="w-full h-full text-blue-600 transition-transform duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-yellow-400" />
              </div>
            </div>
          </motion.div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text transform hover:scale-105 transition-transform">
            Welcome to SMART PARKAI
          </h1>
          <p className="text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The Future of Parking is Here
          </p>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 mx-auto text-blue-500" />
          </motion.div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFeature(index)}
              className="bg-white rounded-xl cursor-pointer transition-all duration-300"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }}
            >
              <div className="p-8 relative">
                <div className={`${feature.color} bg-opacity-10 p-4 rounded-lg inline-block mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Easter Egg Modal */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setShowEasterEgg(false)}
          >
            <motion.div 
              className="bg-white rounded-xl p-8 text-center transition-all duration-300"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}
            >
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                🎉 You Found The Secret! 🎉
              </h3>
              <p className="text-gray-600 mb-4">Here's a virtual high-five for being curious!</p>
              <Award className="w-16 h-16 mx-auto text-yellow-400" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Detail Modal */}
      <AnimatePresence>
        {selectedFeature !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setSelectedFeature(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-md transition-all duration-300"
              onClick={e => e.stopPropagation()}
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}
            >
              <div className={`${features[selectedFeature].color} bg-opacity-20 p-6 rounded-lg mb-6`}>
                {features[selectedFeature].icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{features[selectedFeature].title}</h3>
              <p className="text-gray-600">{features[selectedFeature].description}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AboutPage; 