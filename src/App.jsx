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
  const [completedToday, setCompletedToday] = useState(0);
  const [streak, setStreak] = useState(1);
  const [taskHistory, setTaskHistory] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTaskHistory(prev => ({ ...prev, [today]: completedToday }));
  }, [completedToday]);

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
    setFocusMode(true);
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
    setFocusMode(false);
    setCompletedToday(prev => prev + 1);
    if (currentTaskIndex + 1 < tasks.length) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
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

  const today = new Date().toISOString().split('T')[0];
  const chartData = {
    labels: Object.keys(taskHistory),
    datasets: [
      {
        label: 'Tasks Completed',
        data: Object.values(taskHistory),
        backgroundColor: 'blue',
        borderColor: 'black',
        borderWidth: 2,
      },
    ],
  };

  if (focusMode && isRunning && tasks[currentTaskIndex]) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-black text-white">
        <h1 className="text-2xl font-bold mb-2">Focusing on:</h1>
        <h2 className="text-3xl mb-4">{tasks[currentTaskIndex].name}</h2>
        <p className="text-5xl">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </p>
        <button onClick={handleFinishEarly} className="mt-4 bg-red-600 px-4 py-2 rounded">
          Finish Early
        </button>
      </div>
    );
  }

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

      {!isRunning && currentTaskIndex < tasks.length && (
        <button onClick={handleStart} className="bg-green-500 text-white px-4 py-2 rounded">
          Start Timer
        </button>
      )}

      {showSummary && (
        <div className="mt-6 p-4 border rounded bg-green-100">
          <h2 className="text-lg font-bold mb-2">🎉 Session Complete!</h2>
          <p>Tasks completed: {completedToday}</p>
          <p>
            Total time:{' '}
            {tasks.reduce((total, t) => total + (t.completed ? t.minutes : 0), 0)} min
          </p>
          <p>Streak: {streak} days</p>
        </div>
      )}

      <h2 className="text-lg font-bold mt-6">Streak: {streak} Days</h2>
      <Bar data={chartData} />
    </div>
  );
}

export default App;
