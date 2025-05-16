import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskMinutes, setTaskMinutes] = useState('');
  const [taskPriority, setTaskPriority] = useState('');
  const [isEntering, setIsEntering] = useState(true);
  const [timer, setTimer] = useState(0);
  const [activeTaskIndex, setActiveTaskIndex] = useState(null);
  const intervalRef = useRef(null);

  const totalRemaining = tasks.reduce((sum, task) => sum + (task.remaining || 0), 0);

  useEffect(() => {
    if (timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && activeTaskIndex !== null) {
      stopTimer();
    }
    return () => clearInterval(intervalRef.current);
  }, [timer]);

  const addTask = () => {
    if (!taskName || !taskMinutes || isNaN(taskMinutes) || !taskPriority || isNaN(taskPriority)) return;
    const newTask = {
      name: taskName,
      minutes: parseInt(taskMinutes),
      remaining: parseInt(taskMinutes),
      priority: parseInt(taskPriority)
    };
    setTasks((prev) => [...prev, newTask].sort((a, b) => a.priority - b.priority));
    setTaskName('');
    setTaskMinutes('');
    setTaskPriority('');
  };

  const startTask = (index) => {
    setActiveTaskIndex(index);
    setTimer(tasks[index].remaining * 60);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setTasks((prev) => prev.filter((_, i) => i !== activeTaskIndex));
    setActiveTaskIndex(null);
    setTimer(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') addTask();
  };

  return (
    <div className="p-4 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">Task Focus Timer</h1>

      {isEntering && (
        <div className="space-y-2">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Task name"
            className="border p-2 w-full rounded"
          />
          <input
            type="number"
            value={taskMinutes}
            onChange={(e) => setTaskMinutes(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Minutes"
            className="border p-2 w-full rounded"
          />
          <input
            type="number"
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Priority (e.g., 1, 2, 3...)"
            className="border p-2 w-full rounded"
          />
          <div className="flex gap-2 justify-center">
            <button
              onClick={addTask}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Task
            </button>
            <button
              onClick={() => setIsEntering(false)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Finished Entering
            </button>
          </div>
        </div>
      )}

      {!isEntering && (
        <>
          <div className="space-y-2 mt-6">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-100 rounded shadow"
              >
                <span className="font-medium">
                  {task.name} ({task.minutes} min, priority {task.priority})
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => startTask(index)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    ▶️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeTaskIndex !== null && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">
                Working on: {tasks[activeTaskIndex]?.name}
              </h2>
              <div className="text-2xl font-bold">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</div>
              <button
                onClick={stopTimer}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              >
                Finished Early
              </button>
            </div>
          )}

          <div className="mt-4 text-gray-600">Total remaining: {totalRemaining} min</div>
          <button
            onClick={() => setIsEntering(true)}
            className="mt-4 text-blue-600 underline"
          >
            Add more tasks
          </button>
        </>
      )}
    </div>
  );
}
