import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, X, ChevronRight, Award, RefreshCcw, Trophy, Medal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../hooks/useAuth';
import { leaderboardService } from '../services/leaderboardService';
import LeaderboardComponent from '../components/LeaderboardComponent';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: 'safety' | 'rules' | 'signs' | 'emergency';
}

const TrafficSafetyGame: React.FC = () => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Game state
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      category: 'safety',
      question: 'What is the safe following distance rule in good weather conditions?',
      options: [
        'One car length',
        'Two-second rule',
        'Three-second rule',
        'Half car length'
      ],
      correctAnswer: 2,
      explanation: 'The three-second rule is recommended for safe following distance in good weather. In adverse conditions, increase this to 4-5 seconds.'
    },
    {
      id: 2,
      category: 'rules',
      question: 'When should you use hazard lights?',
      options: [
        'When parking illegally',
        'When your vehicle has broken down and is a hazard',
        'When driving slowly in traffic',
        'When parking normally'
      ],
      correctAnswer: 1,
      explanation: 'Hazard lights should only be used when your vehicle has broken down and poses a hazard to other road users, or in emergency situations.'
    },
    {
      id: 3,
      category: 'signs',
      question: 'What does a yellow diamond-shaped sign typically indicate?',
      options: [
        'Stop ahead',
        'Warning or caution',
        'Speed limit',
        'Parking zone'
      ],
      correctAnswer: 1,
      explanation: 'Yellow diamond-shaped signs are warning signs that alert drivers to upcoming hazards or changes in road conditions.'
    },
    {
      id: 4,
      category: 'emergency',
      question: 'What should you do if your brakes fail?',
      options: [
        'Jump out of the vehicle',
        'Pump the brake pedal, downshift, and use emergency brake',
        'Turn off the engine immediately',
        'Speed up and hope for the best'
      ],
      correctAnswer: 1,
      explanation: 'If your brakes fail, stay calm, pump the brake pedal, gradually downshift to slow down, and carefully apply the emergency brake. Look for a safe area to guide your vehicle.'
    },
    {
      id: 5,
      category: 'safety',
      question: 'What is the correct hand position on the steering wheel?',
      options: [
        '12 and 6 o\'clock',
        '10 and 2 o\'clock',
        '9 and 3 o\'clock',
        'One hand at 12 o\'clock'
      ],
      correctAnswer: 2,
      explanation: '9 and 3 o\'clock is now recommended as it provides the best control and reduces the risk of injury if the airbag deploys.'
    },
    {
      id: 6,
      category: 'rules',
      question: 'When approaching a roundabout, who has the right of way?',
      options: [
        'Vehicles entering the roundabout',
        'Vehicles already in the roundabout',
        'Larger vehicles',
        'Whoever arrives first'
      ],
      correctAnswer: 1,
      explanation: 'Vehicles already in the roundabout have the right of way. Always yield to traffic in the roundabout before entering.'
    },
    {
      id: 7,
      category: 'emergency',
      question: 'What should you do if you encounter hydroplaning?',
      options: [
        'Brake hard immediately',
        'Turn the steering wheel quickly',
        'Take your foot off the gas and steer straight',
        'Accelerate to power through'
      ],
      correctAnswer: 2,
      explanation: 'If hydroplaning, stay calm, take your foot off the gas pedal (don\'t brake), and keep the steering wheel straight until you regain traction.'
    },
    {
      id: 8,
      category: 'safety',
      question: 'What is the primary purpose of anti-lock braking systems (ABS)?',
      options: [
        'To stop faster',
        'To prevent wheel lock-up and maintain steering control',
        'To save fuel',
        'To reduce tire wear'
      ],
      correctAnswer: 1,
      explanation: 'ABS prevents wheels from locking up during hard braking, allowing you to maintain steering control while braking.'
    },
    {
      id: 9,
      category: 'rules',
      question: 'What should you do when approaching a yellow traffic light?',
      options: [
        'Speed up to cross quickly',
        'Prepare to stop if safe to do so',
        'Always stop immediately',
        'Honk to warn other drivers'
      ],
      correctAnswer: 1,
      explanation: 'When approaching a yellow light, you should prepare to stop if it is safe to do so. If you cannot stop safely, proceed with caution.'
    },
    {
      id: 10,
      category: 'safety',
      question: 'What is the correct procedure when an emergency vehicle approaches with sirens on?',
      options: [
        'Speed up to get out of the way',
        'Stop immediately where you are',
        'Pull over to the left side safely',
        'Continue driving normally'
      ],
      correctAnswer: 2,
      explanation: 'When an emergency vehicle approaches, safely pull over to the left side of the road and stop until the vehicle has passed.'
    },
    {
      id: 11,
      category: 'emergency',
      question: 'What should you do if your vehicle starts to skid?',
      options: [
        'Brake hard immediately',
        'Turn the steering wheel in the opposite direction',
        'Look and steer in the direction you want to go',
        'Accelerate to gain control'
      ],
      correctAnswer: 2,
      explanation: 'In a skid, look and steer in the direction you want the car to go. Avoid sudden braking or acceleration.'
    },
    {
      id: 12,
      category: 'safety',
      question: 'What is the recommended method to check blind spots?',
      options: [
        'Use mirrors only',
        'Quick glance over shoulder',
        'Ask passengers to look',
        'Rely on sensors only'
      ],
      correctAnswer: 1,
      explanation: 'Always perform a quick glance over your shoulder in addition to checking mirrors to properly check blind spots.'
    },
    {
      id: 13,
      category: 'rules',
      question: 'When is it legal to use high beam headlights in the city?',
      options: [
        'Never in city limits',
        'Only when no other cars are present',
        'During heavy rain',
        'Always after midnight'
      ],
      correctAnswer: 0,
      explanation: 'High beam headlights should not be used within city limits as they can blind other drivers and are generally unnecessary in well-lit areas.'
    },
    {
      id: 14,
      category: 'emergency',
      question: 'What should you do if you witness a traffic accident?',
      options: [
        'Drive away quickly',
        'Stop and take photos only',
        'Call emergency services and offer help if safe',
        'Wait for others to help'
      ],
      correctAnswer: 2,
      explanation: 'If you witness an accident, safely stop, call emergency services, and offer assistance if it is safe to do so.'
    },
    {
      id: 15,
      category: 'safety',
      question: 'What is the purpose of the "two-second rule"?',
      options: [
        'Time between gear changes',
        'Safe following distance',
        'Reaction time for braking',
        'Traffic light timing'
      ],
      correctAnswer: 1,
      explanation: 'The two-second rule helps maintain a safe following distance from the vehicle ahead, allowing enough time to react to sudden stops.'
    },
    {
      id: 16,
      category: 'rules',
      question: 'When should you use hazard lights while driving?',
      options: [
        'When parking illegally',
        'During heavy rain',
        'When your vehicle becomes a hazard',
        'To thank other drivers'
      ],
      correctAnswer: 2,
      explanation: 'Hazard lights should be used when your vehicle becomes a temporary hazard to other road users, such as during a breakdown.'
    },
    {
      id: 17,
      category: 'safety',
      question: 'What is the correct action when driving in heavy fog?',
      options: [
        'Use high beam lights',
        'Follow closely to the car ahead',
        'Use low beam lights and reduce speed',
        'Drive normally but use hazards'
      ],
      correctAnswer: 2,
      explanation: 'In heavy fog, use low beam lights (high beams reflect off the fog), reduce speed, and maintain a safe distance from other vehicles.'
    },
    {
      id: 18,
      category: 'emergency',
      question: 'How should you respond to a tire blowout while driving?',
      options: [
        'Brake hard immediately',
        'Grip wheel firmly and gradually slow down',
        'Turn sharply to the roadside',
        'Accelerate to maintain control'
      ],
      correctAnswer: 1,
      explanation: 'During a tire blowout, grip the steering wheel firmly, gradually take your foot off the gas, and slowly coast to a safe stop.'
    }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const handleStartGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentQuestion(0);
    setGameOver(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || showExplanation) return;
    
    setSelectedAnswer(answerIndex);
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 100);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion === questions.length - 1) {
      endGame();
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const endGame = async () => {
    setIsPlaying(false);
    setGameOver(true);

    // Submit score to leaderboard if user is logged in
    if (user) {
      await leaderboardService.addScore({
        userId: user.id,
        username: user.name || 'Anonymous',
        score,
        gameType: 'traffic-safety',
        timestamp: new Date()
      });

      // Check if user made it to top 3
      const topPlayers = leaderboardService.getTopPlayers(3, 'traffic-safety');
      const userRank = topPlayers.findIndex(player => player.userId === user.id) + 1;
      
      if (userRank > 0) {
        // Celebrate with confetti for top 3 placement
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Add another confetti burst for first place
        if (userRank === 1) {
          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.6 }
            });
          }, 500);
        }
      }
    }
  };

  const getAchievementMessage = (score: number) => {
    if (score >= questions.length * 90) return "Perfect! You're a Traffic Safety Expert! 🏆";
    if (score >= questions.length * 80) return "Outstanding! You're a Road Safety Pro! 🥇";
    if (score >= questions.length * 70) return "Great job! You're a Safe Driver! 🥈";
    if (score >= questions.length * 60) return "Good effort! Keep practicing! 🥉";
    return "Keep learning! Safety is important! 📚";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'safety': return 'text-blue-600';
      case 'rules': return 'text-purple-600';
      case 'signs': return 'text-yellow-600';
      case 'emergency': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Traffic Safety Quiz
        </h1>

        {!gameStarted ? (
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-4">Test Your Traffic Safety Knowledge</h2>
            <p className="text-gray-600 mb-8">
              Challenge yourself with questions about traffic rules, safety practices, and emergency procedures.
              Learn while you play and become a safer driver!
            </p>
            <button
              onClick={handleStartGame}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:opacity-90 transition-opacity"
            >
              Start Quiz
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-lg">
            {!gameOver ? (
              <>
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-sm font-semibold ${getCategoryColor(questions[currentQuestion].category)}`}>
                      {questions[currentQuestion].category.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">
                      Question {currentQuestion + 1}/{questions.length}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-6">{questions[currentQuestion].question}</h2>
                  <div className="grid gap-4">
                    {questions[currentQuestion].options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(index)}
                        className={`p-4 rounded-lg text-left transition-all ${
                          selectedAnswer === null
                            ? 'bg-gray-50 hover:bg-gray-100'
                            : index === questions[currentQuestion].correctAnswer
                            ? 'bg-green-100 border-green-500'
                            : selectedAnswer === index
                            ? 'bg-red-100 border-red-500'
                            : 'bg-gray-50'
                        } ${
                          selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'
                        }`}
                        disabled={selectedAnswer !== null}
                      >
                        {option}
                        {selectedAnswer !== null && index === questions[currentQuestion].correctAnswer && (
                          <Check className="inline-block ml-2 w-5 h-5 text-green-500" />
                        )}
                        {selectedAnswer === index && index !== questions[currentQuestion].correctAnswer && (
                          <X className="inline-block ml-2 w-5 h-5 text-red-500" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 bg-blue-50 rounded-lg"
                  >
                    <p className="text-gray-700">{questions[currentQuestion].explanation}</p>
                  </motion.div>
                )}

                {showExplanation && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity inline-flex items-center"
                  >
                    {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </motion.button>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Award className={`w-16 h-16 mx-auto mb-4 ${
                  score >= questions.length * 70 ? 'text-yellow-500' : 'text-gray-400'
                }`} />
                <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
                <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
                  <p className="text-xl mb-2">Your Score: {score}</p>
                  <p className="text-lg text-blue-600 font-semibold mb-4">
                    {getAchievementMessage(score)}
                  </p>
                  {user && (
                    <div className="text-gray-600 mb-4">
                      {leaderboardService.getUserStats(user.id)?.rank <= 3 ? (
                        <p className="text-green-600">
                          Congratulations! You're in the top 3! Check your rewards for a special discount.
                        </p>
                      ) : (
                        <p>
                          Keep practicing to reach the top 3 and earn discount rewards!
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                <button
                  onClick={handleStartGame}
                      className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-opacity inline-flex items-center"
                >
                  <RefreshCcw className="mr-2 w-5 h-5" />
                  Try Again
                </button>
                    <button
                      onClick={() => setShowLeaderboard(true)}
                      className="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition-opacity inline-flex items-center"
                    >
                      <Award className="mr-2 w-5 h-5" />
                      View Leaderboard
                    </button>
                  </div>
                  
                  {!showLeaderboard && (
                    <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
                      <h3 className="text-xl font-bold mb-4">Top Performers</h3>
                      <div className="space-y-3">
                        {leaderboardService.getTopPlayers(3, 'traffic-safety').map((player, index) => (
                          <div 
                            key={player.userId}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              player.userId === user?.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              {index === 0 && <Trophy className="w-5 h-5 text-yellow-500 mr-2" />}
                              {index === 1 && <Medal className="w-5 h-5 text-gray-400 mr-2" />}
                              {index === 2 && <Medal className="w-5 h-5 text-amber-600 mr-2" />}
                              <span className="font-semibold">{player.username}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-bold">{player.score}</span>
                              {player.userId === user?.id && (
                                <span className="ml-2 text-blue-600 text-sm">(You)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {showLeaderboard && (
        <div className="mt-8">
          <LeaderboardComponent gameType="traffic-safety" />
        </div>
      )}
    </div>
  );
};

export default TrafficSafetyGame; 