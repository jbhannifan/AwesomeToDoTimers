import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskMinutes, setTaskMinutes] = useState('');
  const [isEntering, setIsEntering] = useState(true);
  const [activeTaskIndex, setActiveTaskIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const handleAddTask = () => {
    if (taskName && taskMinutes) {
      const newTask = {
        name: taskName,
        minutes: parseInt(taskMinutes),
        sortOrder: tasks.length + 1,
      };
      setTasks([...tasks, newTask]);
      setTaskName('');
      setTaskMinutes('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleFinishedEntering = () => {
    const sortedTasks = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);
    setTasks(sortedTasks);
    setIsEntering(false);
  };

  const handleSortOrderChange = (index, newOrder) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].sortOrder = parseInt(newOrder) || 0;
    const reordered = [...updatedTasks].sort((a, b) => a.sortOrder - b.sortOrder);
    setTasks(reordered);
  };

  const startTimer = (index) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveTaskIndex(index);
    setTimeLeft(tasks[index].minutes * 60);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setActiveTaskIndex(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  const totalRemaining = tasks.reduce((sum, task, idx) => {
    return sum + (idx === activeTaskIndex ? Math.ceil(timeLeft / 60) : task.minutes);
  }, 0);

  return (
    <div className="max-w-xl mx-auto p-4 font-sans">
      <h1 className="text-3xl font-bold text-center mb-6">Task Focus Timer</h1>

      {isEntering && (
        <div className="mb-4 bg-white p-4 rounded shadow space-y-2">
          <input
            className="border p-2 w-full rounded"
            placeholder="Task name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <input
            className="border p-2 w-full rounded"
            placeholder="Minutes"
            type="number"
            value={taskMinutes}
            onChange={(e) => setTaskMinutes(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <div className="flex gap-2">
            <button onClick={handleAddTask} className="bg-blue-600 text-white px-4 py-2 rounded">
              Add Task
            </button>
            <button
              onClick={handleFinishedEntering}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Finished Entering
            </button>
          </div>
        </div>
      )}

      {!isEntering && (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded shadow transition-all duration-200 ${
                index === activeTaskIndex ? 'bg-yellow-200 border border-yellow-400' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={task.sortOrder}
                  onChange={(e) => handleSortOrderChange(index, e.target.value)}
                  className="w-14 p-1 text-center border rounded"
                />
                <span className="font-semibold">{task.name}</span>
                <span className="text-gray-600 text-sm">({task.minutes} min)</span>
              </div>
              <button
                onClick={() => startTimer(index)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                ▶
              </button>
            </div>
          ))}
          {activeTaskIndex !== null && (
            <div className="text-center text-2xl font-mono mt-4">
              {formatTime(timeLeft)}
            </div>
          )}
          <div className="text-center text-gray-500 mt-2">
            Total remaining: {totalRemaining} min
          </div>
        </div>
      )}
    </div>
  );
}
