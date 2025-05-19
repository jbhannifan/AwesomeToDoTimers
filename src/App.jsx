import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [minutes, setMinutes] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('history')) || {});
  const timerRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  const handleAddTask = () => {
    if (!newTask.trim() || !minutes || !sortOrder) return;
    const newTaskObj = {
      name: newTask,
      minutes: parseInt(minutes),
      sortOrder: parseInt(sortOrder),
      completed: false,
    };
    const updatedTasks = [...tasks, newTaskObj].sort((a, b) => a.sortOrder - b.sortOrder);
    setTasks(updatedTasks);
    setNewTask('');
    setMinutes('');
    setSortOrder('');
  };

  const handleStart = () => {
    if (tasks.length === 0 || isRunning) return;
    setIsRunning(true);
    setTimeLeft(tasks[currentTaskIndex].minutes * 60);
  };

  const handleFinishEarly = () => {
    clearInterval(timerRef.current);
    markTaskComplete();
  };

  const markTaskComplete = () => {
    const updatedTasks = tasks.map((task, idx) =>
      idx === currentTaskIndex ? { ...task, completed: true } : task
    );
    setTasks(updatedTasks);
    setIsRunning(false);
    setCurrentTaskIndex(prev => prev + 1);

    const completedMinutes = tasks[currentTaskIndex].minutes;
    const updatedHistory = {
      ...history,
      [today]: (history[today] || 0) + completedMinutes,
    };
    setHistory(updatedHistory);
    localStorage.setItem('history', JSON.stringify(updatedHistory));
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      clearInterval(timerRef.current);
      markTaskComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const handleSortChange = (index, newSort) => {
    const updated = [...tasks];
    updated[index].sortOrder = parseInt(newSort) || 0;
    setTasks(updated.sort((a, b) => a.sortOrder - b.sortOrder));
  };

  const streak = Object.keys(history)
    .sort((a, b) => new Date(b) - new Date(a))
    .reduce((acc, date) => {
      if (acc === -1) return 0;
      const current = new Date();
      current.setDate(current.getDate() - acc);
      const target = date;
      return target === current.toISOString().split('T')[0] ? acc + 1 : -1;
    }, 0);

  const chartData = {
    labels: Object.keys(history),
    datasets: [
      {
        label: 'Minutes Completed',
        data: Object.values(history),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Task Focus Timer</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Task"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          className="border p-2 flex-1"
        />
        <input
          type="number"
          placeholder="Minutes"
          value={minutes}
          onChange={e => setMinutes(e.target.value)}
          className="border p-2 w-24"
        />
        <input
          type="number"
          placeholder="#"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="border p-2 w-16"
        />
        <button onClick={handleAddTask} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      <ul className="space-y-2 mb-4">
        {tasks.map((task, idx) => (
          <li key={idx} className="border p-2 flex justify-between items-center">
            <span>
              {task.name} ({task.minutes} min)
              {task.completed && ' ✅'}
            </span>
            <input
              type="number"
              value={task.sortOrder}
              onChange={e => handleSortChange(idx, e.target.value)}
              className="border p-1 w-16 text-center"
            />
          </li>
        ))}
      </ul>

      {isRunning && tasks[currentTaskIndex] && (
        <div className="mb-4">
          <p className="font-bold">Now working on: {tasks[currentTaskIndex].name}</p>
          <p>Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>
          <button onClick={handleFinishEarly} className="mt-2 text-sm text-red-500 underline">
            Finish Early
          </button>
        </div>
      )}

      {!isRunning && currentTaskIndex < tasks.length && (
        <button onClick={handleStart} className="bg-green-500 text-white px-4 py-2 rounded">
          Start Timer
        </button>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Daily Summary</h2>
        <Bar data={chartData} />
        <p className="mt-2">Current Streak: {streak} day(s)</p>
      </div>
    </div>
  );
}

export default App;
