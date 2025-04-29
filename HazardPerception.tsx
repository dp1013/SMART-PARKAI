import React, { useState, useEffect } from 'react';
import { Eye, AlertTriangle, Check, X, Timer, Award, ArrowRight } from 'lucide-react';

interface Hazard {
  description: string;
  position: { x: number; y: number };
  found: boolean;
  radius: number;
}

interface Scenario {
  description: string;
  image: string;
  hazards: Hazard[];
  timeLimit: number;
  hint?: string;
}

const scenarios: Scenario[] = [
  {
    description: "Residential Street: Watch for pedestrians and hidden driveways",
    image: "/scenarios/scenario1.jpg",
    hazards: [
      { description: "Child potentially running into street", position: { x: 30, y: 40 }, found: false, radius: 12 },
      { description: "Hidden driveway with poor visibility", position: { x: 70, y: 60 }, found: false, radius: 15 },
      { description: "Parked car about to pull out", position: { x: 45, y: 55 }, found: false, radius: 10 }
    ],
    timeLimit: 25,
    hint: "Look for movement near parked cars and hidden corners"
  },
  {
    description: "Busy Intersection: Multiple hazards including pedestrians and vehicles",
    image: "/scenarios/scenario2.jpg",
    hazards: [
      { description: "Pedestrian crossing against signal", position: { x: 40, y: 50 }, found: false, radius: 12 },
      { description: "Vehicle running yellow light", position: { x: 60, y: 30 }, found: false, radius: 15 },
      { description: "Cyclist in blind spot", position: { x: 80, y: 70 }, found: false, radius: 10 },
      { description: "Delivery truck blocking view", position: { x: 25, y: 45 }, found: false, radius: 15 }
    ],
    timeLimit: 30,
    hint: "Pay attention to crossing points and blind spots"
  },
  {
    description: "Highway Scene: Challenging weather conditions",
    image: "/scenarios/scenario3.jpg",
    hazards: [
      { description: "Hydroplaning risk area", position: { x: 50, y: 80 }, found: false, radius: 15 },
      { description: "Vehicle with hazard lights", position: { x: 45, y: 40 }, found: false, radius: 12 },
      { description: "Merging truck in low visibility", position: { x: 75, y: 35 }, found: false, radius: 15 },
      { description: "Debris on road", position: { x: 20, y: 60 }, found: false, radius: 10 }
    ],
    timeLimit: 35,
    hint: "Watch for weather-related hazards and sudden vehicle movements"
  }
];

export default function HazardPerception() {
  const [currentScenario, setCurrentScenario] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [foundHazards, setFoundHazards] = useState<string[]>([]);
  const [missedClicks, setMissedClicks] = useState<number>(0);
  const [lastClickPosition, setLastClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [showClickFeedback, setShowClickFeedback] = useState<boolean>(false);
  const [clickSuccess, setClickSuccess] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [combo, setCombo] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleScenarioEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, timeLeft]);

  useEffect(() => {
    if (showClickFeedback) {
      const timer = setTimeout(() => {
        setShowClickFeedback(false);
        setLastClickPosition(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showClickFeedback]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCurrentScenario(0);
    setTimeLeft(scenarios[0].timeLimit);
    setFoundHazards([]);
    setMissedClicks(0);
    setCombo(0);
    setShowHint(false);
  };

  const handleScenarioClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStarted || gameOver) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setLastClickPosition({ x, y });
    setShowClickFeedback(true);

    const currentHazards = scenarios[currentScenario].hazards;
    let hazardFound = false;

    currentHazards.forEach(hazard => {
      const distance = Math.sqrt(
        Math.pow(hazard.position.x - x, 2) + Math.pow(hazard.position.y - y, 2)
      );

      if (distance < hazard.radius && !foundHazards.includes(hazard.description)) {
        setFoundHazards(prev => [...prev, hazard.description]);
        const comboBonus = Math.floor(combo / 2) * 5;
        setScore(prev => prev + 10 + comboBonus);
        setCombo(prev => prev + 1);
        hazardFound = true;
        setClickSuccess(true);
      }
    });

    if (!hazardFound) {
      setMissedClicks(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 5));
      setCombo(0);
      setClickSuccess(false);
    }
  };

  const handleScenarioEnd = () => {
    const bonusPoints = Math.floor((timeLeft / scenarios[currentScenario].timeLimit) * 20);
    setScore(prev => prev + bonusPoints);
    
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1);
      setTimeLeft(scenarios[currentScenario + 1].timeLimit);
      setFoundHazards([]);
      setCombo(0);
      setShowHint(false);
    } else {
      setGameOver(true);
    }
  };

  const getScenarioProgress = () => {
    return `${currentScenario + 1}/${scenarios.length}`;
  };

  const getRank = (score: number) => {
    if (score >= 200) return "Expert Driver";
    if (score >= 150) return "Advanced Observer";
    if (score >= 100) return "Skilled Driver";
    if (score >= 50) return "Cautious Driver";
    return "Novice Driver";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Eye className="w-8 h-8" />
            Hazard Perception Test
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
              <span className="text-lg font-semibold">
                Scenario: {getScenarioProgress()}
              </span>
              {combo > 1 && (
                <span className="text-lg font-semibold text-green-600">
                  Combo: x{combo}!
                </span>
              )}
            </div>
          )}
        </div>

        {!gameStarted && !gameOver && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold mb-4">Ready to Test Your Hazard Perception?</h2>
            <div className="mb-6 text-gray-600 space-y-2">
              <p>Identify potential hazards in real traffic scenarios!</p>
              <p>• Correct identification: +10 points (+ combo bonus)</p>
              <p>• Incorrect click: -5 points (breaks combo)</p>
              <p>• Time bonus: Up to 20 points per scenario</p>
              <p>• Build combos for bonus points!</p>
            </div>
            <button
              onClick={startGame}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Test
            </button>
          </div>
        )}

        {gameStarted && !gameOver && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <p className="font-medium text-blue-800">
                  {scenarios[currentScenario].description}
                </p>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>
              {showHint && (
                <p className="text-sm text-blue-600 mt-2">
                  💡 Hint: {scenarios[currentScenario].hint}
                </p>
              )}
            </div>
            <div
              className="relative h-96 rounded-lg cursor-crosshair overflow-hidden"
              onClick={handleScenarioClick}
            >
              <img
                src={scenarios[currentScenario].image}
                alt={`Traffic scenario ${currentScenario + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              {foundHazards.map((hazard, index) => (
                <div
                  key={index}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: `${scenarios[currentScenario].hazards.find(h => h.description === hazard)?.position.x}%`,
                    top: `${scenarios[currentScenario].hazards.find(h => h.description === hazard)?.position.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center animate-pulse">
                    <Check className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              ))}
              {showClickFeedback && lastClickPosition && (
                <div
                  className="absolute flex items-center justify-center transition-opacity duration-500"
                  style={{
                    left: `${lastClickPosition.x}%`,
                    top: `${lastClickPosition.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className={`w-12 h-12 rounded-full ${clickSuccess ? 'bg-green-500' : 'bg-red-500'} bg-opacity-20 flex items-center justify-center`}>
                    {clickSuccess ? (
                      <Check className="w-6 h-6 text-green-500" />
                    ) : (
                      <X className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
                Found Hazards ({foundHazards.length}/{scenarios[currentScenario].hazards.length}):
              </h3>
              <ul className="list-disc pl-5">
                {foundHazards.map((hazard, index) => (
                  <li key={index} className="text-gray-700">{hazard}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold mb-4">Test Complete!</h2>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-blue-600 mb-4">
                {getRank(score)}
              </div>
              <p className="text-lg">Final Score: {score}</p>
              <p className="text-lg">Accuracy: {Math.round((score / (missedClicks * 5 + score)) * 100)}%</p>
              <div className="mt-8">
                <button
                  onClick={startGame}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 