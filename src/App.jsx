import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskMinutes, setTaskMinutes] = useState('');
  const [taskPriority, setTaskPriority] = useState('');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const taskNameInputRef = useRef(null);

  useEffect(() => {
    if (timeLeft > 0 && isRunning) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, isRunning]);

  const handleAddTask = () => {
    if (!taskName || !taskMinutes || !taskPriority) return;
    const newTask = {
      name: taskName,
      minutes: parseInt(taskMinutes),
      priority: parseInt(taskPriority),
    };
    const updatedTasks = [...tasks, newTask].sort((a, b) => a.priority - b.priority);
    setTasks(updatedTasks);
    setTaskName('');
    setTaskMinutes('');
    setTaskPriority('');
    taskNameInputRef.current?.focus();
  };

  const handleStart = (index) => {
    setCurrentTaskIndex(index);
    setTimeLeft(tasks[index].minutes * 60);
    setIsRunning(true);
  };

  const totalRemaining = tasks.reduce((sum, task) => sum + task.minutes, 0);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Task Focus Timer</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          ref={taskNameInputRef}
          type="text"
          placeholder="Task name"
          className="border p-2 rounded w-full mb-2"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Minutes"
          className="border p-2 rounded w-full mb-2"
          value={taskMinutes}
          onChange={(e) => setTaskMinutes(e.target.value)}
        />
        <input
          type="number"
          placeholder="Priority"
          className="border p-2 rounded w-full mb-4"
          value={taskPriority}
          onChange={(e) => setTaskPriority(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <div className="flex gap-4">
          <button
            onClick={handleAddTask}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Task
          </button>
        </div>
      </div>

      <div>
        {tasks.map((task, index) => (
          <div key={index} className="bg-gray-100 p-3 rounded mb-2 flex justify-between items-center">
            <span>
              {task.name} ({task.minutes} min, priority {task.priority})
            </span>
            <button
              onClick={() => handleStart(index)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              ▶
            </button>
          </div>
        ))}
      </div>

      {isRunning && (
        <div className="text-center mt-6">
          <h2 className="text-xl font-bold">{tasks[currentTaskIndex]?.name}</h2>
          <p className="text-2xl">{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</p>
        </div>
      )}

      <p className="text-center mt-4 text-gray-600">Total remaining: {totalRemaining} min</p>
    </div>
  );
}
