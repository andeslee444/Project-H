import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [showMoodLogger, setShowMoodLogger] = useState(false);
  const [moodData, setMoodData] = useState({});
  const [currentStreak, setCurrentStreak] = useState(7);
  const [averageMood, setAverageMood] = useState(7.2);



  // Mock mood data - in real app, this would come from API
  useEffect(() => {
    const mockData = {};
    const today = new Date();
    
    // Generate some sample mood data
    for (let i = 0; i < 84; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // 70% chance of having a mood entry
      if (Math.random() > 0.3) {
        mockData[dateStr] = {
          mood: Math.floor(Math.random() * 10) + 1, // 1-10 scale
          note: Math.random() > 0.7 ? 'Had a good therapy session today' : null,
          timestamp: date.toISOString()
        };
      }
    }
    
    setMoodData(mockData);
  }, []);

  const getMoodColor = (mood) => {
    if (!mood) return 'bg-gray-100 dark:bg-gray-800'; // No data
    
    // GitHub-style green scale for positive moods, red for negative
    const colors = {
      1: 'bg-red-600 dark:bg-red-700',      // Very bad
      2: 'bg-red-500 dark:bg-red-600',      // Bad
      3: 'bg-red-400 dark:bg-red-500',      // Poor
      4: 'bg-orange-400 dark:bg-orange-500', // Below average
      5: 'bg-yellow-400 dark:bg-yellow-500', // Average
      6: 'bg-green-300 dark:bg-green-600',   // Slightly good
      7: 'bg-green-400 dark:bg-green-500',   // Good
      8: 'bg-green-500 dark:bg-green-400',   // Very good
      9: 'bg-green-600 dark:bg-green-300',   // Excellent
      10: 'bg-green-700 dark:bg-green-200'   // Outstanding
    };
    
    return colors[mood] || 'bg-gray-100 dark:bg-gray-800';
  };

  const getMoodLabel = (mood) => {
    const labels = {
      1: 'Very Bad', 2: 'Bad', 3: 'Poor', 4: 'Below Average', 5: 'Average',
      6: 'Slightly Good', 7: 'Good', 8: 'Very Good', 9: 'Excellent', 10: 'Outstanding'
    };
    return labels[mood] || 'No data';
  };

  const handleMoodLog = (mood, note = '') => {
    const today = new Date().toISOString().split('T')[0];
    const newMoodData = {
      ...moodData,
      [today]: {
        mood,
        note,
        timestamp: new Date().toISOString()
      }
    };
    
    setMoodData(newMoodData);
    setShowMoodLogger(false);
    
    // Update streak and average (simplified calculation)
    setCurrentStreak(prev => prev + 1);
    const moods = Object.values(newMoodData).map(d => d.mood);
    const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
    setAverageMood(Math.round(avg * 10) / 10);
  };

  const MoodLoggerModal = () => (
    <AnimatePresence>
      {showMoodLogger && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowMoodLogger(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">How are you feeling today?</h3>
              <p className="text-gray-600">Rate your mood on a scale of 1-10</p>
            </div>
            
            <div className="grid grid-cols-5 gap-3 mb-6">
              {[1,2,3,4,5,6,7,8,9,10].map((mood) => (
                <motion.button
                  key={mood}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(mood)}
                  className={`
                    aspect-square rounded-xl border-2 font-bold text-sm transition-all
                    ${selectedMood === mood 
                      ? `${getMoodColor(mood)} border-gray-800 text-white shadow-lg` 
                      : `${getMoodColor(mood)} border-gray-300 text-gray-800 hover:border-gray-400`
                    }
                  `}
                >
                  {mood}
                </motion.button>
              ))}
            </div>
            
            {selectedMood && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <p className="text-center text-lg font-medium text-gray-900 mb-4">
                  {getMoodLabel(selectedMood)} ({selectedMood}/10)
                </p>
                
                <textarea
                  placeholder="Optional: Add a note about your mood today..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  id="mood-note"
                />
              </motion.div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMoodLogger(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedMood) {
                    const note = document.getElementById('mood-note')?.value || '';
                    handleMoodLog(selectedMood, note);
                    setSelectedMood(null);
                  }
                }}
                disabled={!selectedMood}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Log Mood
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );



  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Mood Contributions</h2>
            <p className="text-sm text-gray-500 mt-1">Track your emotional wellness journey</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMoodLogger(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Log Mood</span>
          </motion.button>
        </div>

        {/* Stats Row - GitHub style */}
        <div className="flex items-center space-x-6 text-sm mb-6">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">{Object.keys(moodData).length}</span>
            <span className="text-gray-600">mood entries in the last 12 weeks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
            <span className="text-gray-600">Current streak: {currentStreak} days</span>
          </div>
        </div>

        {/* Mountain Range Mood Visualization */}
        <div className="relative h-80 overflow-hidden rounded-xl bg-gradient-to-b from-blue-50 to-blue-100">
          {/* Enhanced Sky gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-pink-100 via-purple-100 via-blue-100 to-blue-200"></div>
          
          {/* Sun/Moon based on average mood */}
          <div className="absolute top-6 right-6">
            {averageMood >= 6 ? (
              // Sun for good mood average
              <div className="relative">
                <div className="w-12 h-12 bg-yellow-300 rounded-full shadow-lg animate-pulse"></div>
                <div className="absolute inset-0 w-12 h-12 bg-yellow-200 rounded-full animate-ping"></div>
              </div>
            ) : (
              // Moon for lower mood average
              <div className="w-12 h-12 bg-gray-200 rounded-full shadow-lg relative overflow-hidden">
                <div className="absolute top-1 right-1 w-8 h-8 bg-gray-100 rounded-full"></div>
              </div>
            )}
          </div>
          
          {/* Clouds for low mood days */}
          {Object.values(moodData).filter(d => d.mood <= 4).length > 0 && (
            <>
              <div className="absolute top-8 left-16 opacity-70">
                <div className="flex space-x-2">
                  <div className="w-16 h-8 bg-gray-300 rounded-full"></div>
                  <div className="w-12 h-8 bg-gray-300 rounded-full -ml-6"></div>
                </div>
              </div>
              <div className="absolute top-12 left-48 opacity-50">
                <div className="w-20 h-10 bg-gray-300 rounded-full"></div>
              </div>
            </>
          )}
          
          {/* Enhanced 3D Mountain range */}
          <svg className="absolute bottom-0 w-full h-64" viewBox="0 0 800 250" preserveAspectRatio="none">
            <defs>
              {/* Mountain face gradient - bright vibrant colors */}
              <linearGradient id="mountainFace" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                <stop offset="30%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
                <stop offset="60%" style={{ stopColor: '#047857', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#064e3b', stopOpacity: 1 }} />
              </linearGradient>
              
              {/* Mountain shadow side - darker for 3D effect */}
              <linearGradient id="mountainShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#047857', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: '#064e3b', stopOpacity: 1 }} />
              </linearGradient>
              
              {/* Snow gradient for peaks */}
              <linearGradient id="snowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#f3f4f6', stopOpacity: 0.8 }} />
              </linearGradient>
              
              {/* Filter for mountain texture */}
              <filter id="mountainTexture">
                <feTurbulence baseFrequency="0.9" numOctaves="4" result="turbulence"/>
                <feColorMatrix in="turbulence" type="saturate" values="0"/>
                <feBlend in="SourceGraphic" in2="turbulence" mode="multiply" result="blend"/>
              </filter>
            </defs>
            
            {/* Back mountain layer (for depth) */}
            <path
              d={(() => {
                const sortedDates = Object.keys(moodData).sort();
                if (sortedDates.length === 0) return '';
                
                let path = 'M 0 250 ';
                const width = 800;
                const height = 250;
                const padding = 20;
                
                sortedDates.forEach((date, index) => {
                  const mood = moodData[date]?.mood || 5;
                  const x = (index / (sortedDates.length - 1)) * (width - 2 * padding) + padding;
                  const y = height - (mood / 10) * (height - 60) - 30;
                  
                  if (index === 0) {
                    path += `L ${x} ${y + 20} `;
                  } else {
                    const prevDate = sortedDates[index - 1];
                    const prevMood = moodData[prevDate]?.mood || 5;
                    const prevX = ((index - 1) / (sortedDates.length - 1)) * (width - 2 * padding) + padding;
                    const prevY = height - (prevMood / 10) * (height - 60) - 30;
                    
                    const cp1x = prevX + (x - prevX) / 3;
                    const cp1y = prevY + 20;
                    const cp2x = x - (x - prevX) / 3;
                    const cp2y = y + 20;
                    
                    path += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y + 20} `;
                  }
                });
                
                path += `L ${width} 250 L 0 250 Z`;
                return path;
              })()}
              fill="#6b7280"
              opacity="0.3"
              className="drop-shadow-lg"
            />
            
            {/* Main mountain range with 3D effect */}
            <path
              d={(() => {
                const sortedDates = Object.keys(moodData).sort();
                if (sortedDates.length === 0) return '';
                
                let path = 'M 0 250 ';
                const width = 800;
                const height = 250;
                const padding = 20;
                
                sortedDates.forEach((date, index) => {
                  const mood = moodData[date]?.mood || 5;
                  const x = (index / (sortedDates.length - 1)) * (width - 2 * padding) + padding;
                  const y = height - (mood / 10) * (height - 60) - 40;
                  
                  if (index === 0) {
                    path += `L ${x} ${y} `;
                  } else {
                    const prevDate = sortedDates[index - 1];
                    const prevMood = moodData[prevDate]?.mood || 5;
                    const prevX = ((index - 1) / (sortedDates.length - 1)) * (width - 2 * padding) + padding;
                    const prevY = height - (prevMood / 10) * (height - 60) - 40;
                    
                    const cp1x = prevX + (x - prevX) / 3;
                    const cp1y = prevY;
                    const cp2x = x - (x - prevX) / 3;
                    const cp2y = y;
                    
                    path += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y} `;
                  }
                });
                
                path += `L ${width} 250 L 0 250 Z`;
                return path;
              })()}
              fill="url(#mountainFace)"
              filter="url(#mountainTexture)"
              className="drop-shadow-2xl"
            />
            
            
          </svg>
          
          
          {/* Interactive mood points */}
          <div className="absolute bottom-0 w-full h-64">
            {Object.entries(moodData).sort(([a], [b]) => a.localeCompare(b)).map(([date, data], index, array) => {
              const x = (index / (array.length - 1)) * 95 + 2.5;
              const y = 30 + (1 - data.mood / 10) * 50; // Inverted so high moods are high on screen
              
              return (
                <motion.div
                  key={date}
                  className="absolute group cursor-pointer"
                  style={{ left: `${x}%`, bottom: `${y}%` }}
                  whileHover={{ scale: 1.5 }}
                  onClick={() => setShowMoodLogger(true)}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    data.mood >= 7 ? 'bg-green-500' : 
                    data.mood >= 5 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  } shadow-lg`}></div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="font-semibold">{getMoodLabel(data.mood)}</div>
                    <div className="text-gray-300">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div className="text-gray-400">Elevation: {data.mood}/10</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Time period label */}
          <div className="absolute bottom-2 left-4 text-xs text-gray-600 bg-white/70 px-2 py-1 rounded">
            Past 12 weeks
          </div>
        </div>

      </motion.div>

      {/* Activity Overview - GitHub Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl shadow-lg p-6 mt-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contribution Activity */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Recent Activity</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">This week</span>
                <span className="font-semibold text-gray-900">{currentStreak} logs</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Longest streak</span>
                <span className="font-semibold text-gray-900">14 days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total logs</span>
                <span className="font-semibold text-gray-900">{Object.keys(moodData).length}</span>
              </div>
            </div>
          </div>
          
          {/* Mood Distribution */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Mood Distribution</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">65% positive</span>
              </div>
              <div className="text-sm text-gray-600">
                Average mood: <span className="font-semibold text-gray-900">{averageMood}/10</span>
              </div>
              <div className="text-sm text-gray-600">
                Most common: <span className="font-semibold text-gray-900">Good (7/10)</span>
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Recommendations</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Keep up your daily logging streak!</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500">💡</span>
                <span>Try logging at the same time each day</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-500">📈</span>
                <span>Your mood is trending upward</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <MoodLoggerModal />
    </>
  );
};

export default MoodTracker;