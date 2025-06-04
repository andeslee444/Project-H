import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [showMoodLogger, setShowMoodLogger] = useState(false);
  const [moodData, setMoodData] = useState({});
  const [currentStreak, setCurrentStreak] = useState(7);
  const [averageMood, setAverageMood] = useState(7.2);

  // Generate the last 12 weeks of dates (84 days)
  const generateDateGrid = () => {
    const today = new Date();
    const grid = [];
    const weeks = 12;
    
    for (let week = weeks - 1; week >= 0; week--) {
      const weekData = [];
      for (let day = 6; day >= 0; day--) {
        const date = new Date(today);
        date.setDate(today.getDate() - (week * 7 + day));
        weekData.unshift(date.toISOString().split('T')[0]);
      }
      grid.push(weekData);
    }
    return grid;
  };

  const dateGrid = generateDateGrid();

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
    if (!mood) return 'bg-gray-100'; // No data
    
    // Green to red scale based on mood (1-10)
    const colors = {
      1: 'bg-red-900',     // Very bad
      2: 'bg-red-700',     // Bad
      3: 'bg-red-500',     // Poor
      4: 'bg-orange-500',  // Below average
      5: 'bg-yellow-500',  // Average
      6: 'bg-yellow-300',  // Slightly good
      7: 'bg-green-300',   // Good
      8: 'bg-green-500',   // Very good
      9: 'bg-green-700',   // Excellent
      10: 'bg-green-900'   // Outstanding
    };
    
    return colors[mood] || 'bg-gray-100';
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
            <h2 className="text-lg font-semibold text-gray-900">Mood Tracker</h2>
            <p className="text-sm text-gray-600">Your emotional wellness journey over the past 12 weeks</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMoodLogger(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>😊</span>
            <span>Log Today's Mood</span>
          </motion.button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{currentStreak}</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{averageMood}</div>
            <div className="text-xs text-gray-600">Average Mood</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(moodData).length}
            </div>
            <div className="text-xs text-gray-600">Total Entries</div>
          </div>
        </div>

        {/* GitHub-style Contributions Grid */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">
              {Object.keys(moodData).length} mood entries in the last 12 weeks
            </span>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <span>Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                <div className="w-3 h-3 bg-red-300 rounded-sm"></div>
                <div className="w-3 h-3 bg-yellow-300 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
              </div>
              <span>More</span>
            </div>
          </div>
          
          <div className="grid grid-cols-12 gap-1">
            {dateGrid.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-1">
                {week.map((date, dayIndex) => {
                  const moodEntry = moodData[date];
                  return (
                    <motion.div
                      key={date}
                      whileHover={{ scale: 1.2 }}
                      className={`
                        w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-blue-300
                        ${getMoodColor(moodEntry?.mood)}
                      `}
                      title={`${date}: ${moodEntry ? `${getMoodLabel(moodEntry.mood)} (${moodEntry.mood}/10)` : 'No data'}`}
                      onClick={() => {
                        if (moodEntry) {
                          alert(`${date}\nMood: ${getMoodLabel(moodEntry.mood)} (${moodEntry.mood}/10)\n${moodEntry.note ? `Note: ${moodEntry.note}` : ''}`);
                        }
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Month Labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
            <span key={month} className={index % 3 === 0 ? '' : 'opacity-0'}>
              {month}
            </span>
          ))}
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-xl">📊</span>
            <h3 className="font-semibold text-gray-900">Insights</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• You've been consistent with mood tracking - great job!</p>
            <p>• Your mood has improved by 15% over the past month</p>
            <p>• Consider discussing your positive trend with Dr. Johnson</p>
          </div>
        </div>
      </motion.div>

      <MoodLoggerModal />
    </>
  );
};

export default MoodTracker;