import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [minutes, setMinutes] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem('taskHistory');
    return stored ? JSON.parse(stored) : {};
  });
  const timerRef = useRef(null);

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
    const completedTask = tasks[currentTaskIndex];
    const today = new Date().toISOString().slice(0, 10);
    const updatedHistory = { ...history, [today]: (history[today] || 0) + 1 };
    setHistory(updatedHistory);
    localStorage.setItem('taskHistory', JSON.stringify(updatedHistory));

    const updatedTasks = tasks.map((task, idx) =>
      idx === currentTaskIndex ? { ...task, completed: true } : task
    );
    setTasks(updatedTasks);
    setIsRunning(false);
    setCurrentTaskIndex(prev => prev + 1);
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

  const calculateStreak = () => {
    const dates = Object.keys(history).sort().reverse();
    let streak = 0;
    for (let i = 0; i < dates.length; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().slice(0, 10);
      if (history[dateString]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

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

      {Object.keys(history).length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Streak: {streak} {streak === 1 ? 'day' : 'days'}</h2>
          <Bar
            data={{
              labels: Object.keys(history),
              datasets: [{
                label: 'Tasks Completed',
                data: Object.values(history),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'blue',
                borderWidth: 1,
              }],
            }}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  precision: 0,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
