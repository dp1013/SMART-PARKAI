import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Check, 
  X, 
  Timer, 
  Award, 
  Book, 
  ArrowRight, 
  Zap, 
  Octagon, 
  CircleOff, 
  CircleDot, 
  ParkingCircle,
  Ban,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
  Bike,
  Car,
  Construction,
  CrosshairIcon,
  School,
  Signal,
  Snowflake,
  Truck,
  Merge,
  Split,
  MoveLeft,
  MoveRight,
  Users,
  Clock,
  Info,
  RefreshCcw,
  Trophy,
  Medal
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { leaderboardService } from '../services/leaderboardService';
import LeaderboardComponent from '../components/LeaderboardComponent';
import confetti from 'canvas-confetti';

interface RoadSign {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'warning' | 'regulatory' | 'information';
  difficulty: 1 | 2 | 3;
}

const roadSigns: RoadSign[] = [
  // Warning Signs
  {
    id: 'w1',
    name: 'General Warning',
    description: 'Caution required ahead',
    icon: <AlertTriangle className="w-32 h-32 text-yellow-500" />,
    category: 'warning',
    difficulty: 1
  },
  {
    id: 'w2',
    name: 'Construction Zone',
    description: 'Road work ahead, proceed with caution',
    icon: <Construction className="w-32 h-32 text-yellow-500" />,
    category: 'warning',
    difficulty: 1
  },
  {
    id: 'w3',
    name: 'School Zone',
    description: 'School area, watch for children',
    icon: <School className="w-32 h-32 text-yellow-500" />,
    category: 'warning',
    difficulty: 1
  },
  {
    id: 'w4',
    name: 'Slippery Road',
    description: 'Road may be slippery when wet',
    icon: <Snowflake className="w-32 h-32 text-yellow-500" />,
    category: 'warning',
    difficulty: 2
  },
  {
    id: 'w5',
    name: 'Crossroads',
    description: 'Intersection ahead',
    icon: <CrosshairIcon className="w-32 h-32 text-yellow-500" />,
    category: 'warning',
    difficulty: 2
  },
  {
    id: 'w6',
    name: 'Railway Crossing',
    description: 'Railway crossing ahead, prepare to stop',
    icon: <AlertTriangle className="w-32 h-32 text-yellow-500" />,
    category: 'warning',
    difficulty: 1
  },
  {
    id: 'w7',
    name: 'Pedestrian Crossing',
    description: 'Watch for pedestrians crossing the road',
    icon: <Users className="w-32 h-32 text-yellow-500" />,
    category: 'warning',
    difficulty: 1
  },
  {
    id: 'w8',
    name: 'Narrow Bridge',
    description: 'Bridge narrows ahead, exercise caution',
    icon: <MoveLeft className="w-32 h-32 text-yellow-500" />,
    category: 'warning',
    difficulty: 2
  },
  {
    id: 'w9',
    name: 'Two Way Traffic',
    description: 'Two-way traffic ahead, stay in your lane',
    icon: <Split className="w-32 h-32 text-yellow-500" />,
    category: 'warning',
    difficulty: 2
  },

  // Regulatory Signs
  {
    id: 'r1',
    name: 'Stop',
    description: 'Complete stop required',
    icon: <Octagon className="w-32 h-32 text-red-600" />,
    category: 'regulatory',
    difficulty: 1
  },
  {
    id: 'r2',
    name: 'No Entry',
    description: 'Entry prohibited for all vehicles',
    icon: <CircleOff className="w-32 h-32 text-red-500" />,
    category: 'regulatory',
    difficulty: 1
  },
  {
    id: 'r3',
    name: 'No Vehicles',
    description: 'No vehicles allowed',
    icon: <Ban className="w-32 h-32 text-red-500" />,
    category: 'regulatory',
    difficulty: 1
  },
  {
    id: 'r4',
    name: 'Turn Left',
    description: 'Mandatory left turn ahead',
    icon: <ArrowBigLeft className="w-32 h-32 text-blue-600" />,
    category: 'regulatory',
    difficulty: 2
  },
  {
    id: 'r5',
    name: 'Turn Right',
    description: 'Mandatory right turn ahead',
    icon: <ArrowBigRight className="w-32 h-32 text-blue-600" />,
    category: 'regulatory',
    difficulty: 2
  },
  {
    id: 'r6',
    name: 'One Way',
    description: 'One way traffic ahead',
    icon: <ArrowBigUp className="w-32 h-32 text-blue-600" />,
    category: 'regulatory',
    difficulty: 2
  },
  {
    id: 'r7',
    name: 'Speed Limit',
    description: 'Maximum speed limit for this road',
    icon: <Clock className="w-32 h-32 text-red-600" />,
    category: 'regulatory',
    difficulty: 1
  },
  {
    id: 'r8',
    name: 'No Overtaking',
    description: 'Overtaking not allowed on this stretch',
    icon: <Ban className="w-32 h-32 text-red-500" />,
    category: 'regulatory',
    difficulty: 2
  },
  {
    id: 'r9',
    name: 'No Honking',
    description: 'Use of horn prohibited in this zone',
    icon: <CircleOff className="w-32 h-32 text-red-500" />,
    category: 'regulatory',
    difficulty: 2
  },
  {
    id: 'r10',
    name: 'Weight Limit',
    description: 'Maximum vehicle weight allowed',
    icon: <Truck className="w-32 h-32 text-red-500" />,
    category: 'regulatory',
    difficulty: 3
  },

  // Information Signs
  {
    id: 'i1',
    name: 'Information Point',
    description: 'Information center nearby',
    icon: <CircleDot className="w-32 h-32 text-blue-500" />,
    category: 'information',
    difficulty: 1
  },
  {
    id: 'i2',
    name: 'Parking Area',
    description: 'Parking area available',
    icon: <ParkingCircle className="w-32 h-32 text-blue-500" />,
    category: 'information',
    difficulty: 1
  },
  {
    id: 'i3',
    name: 'Bicycle Lane',
    description: 'Dedicated bicycle lane ahead',
    icon: <Bike className="w-32 h-32 text-blue-500" />,
    category: 'information',
    difficulty: 2
  },
  {
    id: 'i4',
    name: 'Car Route',
    description: 'Car route information',
    icon: <Car className="w-32 h-32 text-blue-500" />,
    category: 'information',
    difficulty: 2
  },
  {
    id: 'i5',
    name: 'Truck Route',
    description: 'Designated truck route',
    icon: <Truck className="w-32 h-32 text-blue-500" />,
    category: 'information',
    difficulty: 2
  },
  {
    id: 'i6',
    name: 'Traffic Signal',
    description: 'Traffic signal ahead',
    icon: <Signal className="w-32 h-32 text-blue-500" />,
    category: 'information',
    difficulty: 1
  },
  {
    id: 'i7',
    name: 'Merge',
    description: 'Lanes merging ahead',
    icon: <Merge className="w-32 h-32 text-blue-500" />,
    category: 'information',
    difficulty: 2
  },
  {
    id: 'i8',
    name: 'Split',
    description: 'Road splits ahead',
    icon: <Split className="w-32 h-32 text-blue-500" />,
    category: 'information',
    difficulty: 2
  },
  {
    id: 'i9',
    name: 'Hospital Ahead',
    description: 'Hospital zone, drive carefully',
    icon: <CircleDot className="w-32 h-32 text-blue-500" />,
    category: 'information',
    difficulty: 1
  },
  {
    id: 'i10',
    name: 'Fuel Station',
    description: 'Fuel station available ahead',
    icon: <Zap className="w-32 h-32 text-blue-500" />,
    category: 'information',
    difficulty: 1
  },
  {
    id: 'i11',
    name: 'Emergency Exit',
    description: 'Emergency exit or escape route',
    icon: <ArrowRight className="w-32 h-32 text-green-500" />,
    category: 'information',
    difficulty: 2
  },
  {
    id: 'i12',
    name: 'Tourist Information',
    description: 'Tourist information center ahead',
    icon: <Info className="w-32 h-32 text-blue-500" />,
    category: 'information',
    difficulty: 2
  }
];

interface Question {
  sign: RoadSign;
  options: string[];
  correctAnswer: string;
}

export default function RoadSignChallenge() {
  const { user } = useAuth();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<'all' | 'warning' | 'regulatory' | 'information'>('all');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const generateQuestion = () => {
    let availableSigns = roadSigns;
    
    if (category !== 'all') {
      availableSigns = roadSigns.filter(sign => sign.category === category);
    }
    
    availableSigns = availableSigns.filter(sign => sign.difficulty <= difficulty);
    
    const randomSign = availableSigns[Math.floor(Math.random() * availableSigns.length)];
    const otherSigns = availableSigns.filter(s => s.id !== randomSign.id);
    const wrongOptions = otherSigns
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(s => s.name);
    
    const options = [...wrongOptions, randomSign.name].sort(() => Math.random() - 0.5);
    
    return {
      sign: randomSign,
      options,
      correctAnswer: randomSign.name
    };
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, timeLeft]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    setStreak(0);
    setQuestionsAnswered(0);
    setCurrentQuestion(generateQuestion());
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const correct = answer === currentQuestion.correctAnswer;
    const timeBonus = Math.floor(timeLeft / 10);
    const streakBonus = Math.floor(streak / 3) * 5;
    
    if (correct) {
      setScore(prev => prev + 10 + timeBonus + streakBonus);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowFeedback(false);
      setCurrentQuestion(generateQuestion());
      setQuestionsAnswered(prev => prev + 1);
    }, 1500);
  };

  const endGame = async () => {
    setGameOver(true);

    // Submit score to leaderboard if user is logged in
    if (user) {
      await leaderboardService.addScore({
        userId: user.id,
        username: user.name || 'Anonymous',
        score,
        gameType: 'road-signs',
        timestamp: new Date()
      });

      // Check if user made it to top 3
      const topPlayers = leaderboardService.getTopPlayers(3, 'road-signs');
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

  const getRank = (score: number) => {
    if (score >= 200) return { title: "Road Sign Expert", icon: "🏆", color: "text-yellow-600" };
    if (score >= 150) return { title: "Advanced Driver", icon: "🥇", color: "text-blue-600" };
    if (score >= 100) return { title: "Skilled Driver", icon: "🥈", color: "text-green-600" };
    if (score >= 50) return { title: "Novice Driver", icon: "🥉", color: "text-gray-600" };
    return { title: "Beginner", icon: "🎯", color: "text-gray-600" };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-8 h-8" />
            Road Sign Challenge
          </h1>
          {gameStarted && !gameOver && (
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold flex items-center gap-1">
                <Award className="w-5 h-5" />
                Score: {score}
              </span>
              <span className="text-lg font-semibold flex items-center gap-1">
                <Timer className="w-5 h-5" />
                {timeLeft}s
              </span>
              {streak > 1 && (
                <span className="text-lg font-semibold text-green-600 flex items-center gap-1">
                  <Zap className="w-5 h-5" />
                  Streak: {streak}
                </span>
              )}
            </div>
          )}
        </div>

        {!gameStarted && !gameOver && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold mb-4">Test Your Road Sign Knowledge!</h2>
            <div className="mb-6 space-y-4">
              <div className="flex justify-center gap-4">
                <select
                  className="px-4 py-2 rounded-lg border border-gray-300"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  aria-label="Select sign category"
                >
                  <option value="all">All Categories</option>
                  <option value="warning">Warning Signs</option>
                  <option value="regulatory">Regulatory Signs</option>
                  <option value="information">Information Signs</option>
                </select>
                <select
                  className="px-4 py-2 rounded-lg border border-gray-300"
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value) as 1 | 2 | 3)}
                  aria-label="Select difficulty level"
                >
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
                </select>
              </div>
              <div className="text-gray-600 space-y-2">
                <p>• Identify road signs quickly and accurately</p>
                <p>• Score points based on speed and accuracy</p>
                <p>• Build streaks for bonus points</p>
                <p>• Complete as many signs as possible in 60 seconds</p>
              </div>
            </div>
            <button
              onClick={startGame}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Challenge
            </button>
          </div>
        )}

        {gameStarted && !gameOver && currentQuestion && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-64 h-64 relative bg-white rounded-lg shadow-md flex items-center justify-center">
                {currentQuestion.sign.icon}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={!!selectedAnswer}
                  className={`p-4 rounded-lg text-lg font-medium transition-colors ${
                    selectedAnswer
                      ? option === currentQuestion.correctAnswer
                        ? 'bg-green-500 text-white'
                        : option === selectedAnswer
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {showFeedback && (
              <div className="text-center">
                <p className="text-lg font-medium">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <span className="text-green-600">Correct! +10 points</span>
                  ) : (
                    <span className="text-red-600">
                      Incorrect! The answer was: {currentQuestion.correctAnswer}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {currentQuestion.sign.description}
                </p>
              </div>
            )}
          </div>
        )}

        {gameOver && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold mb-4">Challenge Complete!</h2>
            <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
              <div className={`text-3xl font-bold mb-4 ${getRank(score).color}`}>
                {getRank(score).icon} {getRank(score).title}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600">Final Score</p>
                  <p className="text-2xl font-bold">{score}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600">Questions</p>
                  <p className="text-2xl font-bold">{questionsAnswered}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600">Accuracy</p>
                  <p className="text-2xl font-bold">
                    {questionsAnswered > 0 ? Math.round((streak / questionsAnswered) * 100) : 0}%
                  </p>
                </div>
              </div>

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
                  onClick={startGame}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <RefreshCcw className="mr-2 w-5 h-5" />
                  Try Again
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                >
                  <Award className="mr-2 w-5 h-5" />
                  View Leaderboard
                </button>
              </div>

              {!showLeaderboard && (
                <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Top Performers</h3>
                  <div className="space-y-3">
                    {leaderboardService.getTopPlayers(3, 'road-signs').map((player, index) => (
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
          </div>
        )}

        {showLeaderboard && (
          <div className="mt-8">
            <LeaderboardComponent gameType="road-signs" />
          </div>
        )}
      </div>
    </div>
  );
} 