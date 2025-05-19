import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [minutes, setMinutes] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [view, setView] = useState('tasks');
  const [completedToday, setCompletedToday] = useState(0);
  const [streak, setStreak] = useState(
    parseInt(localStorage.getItem('streak') || '0')
  );
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem('history') || '[]')
  );
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const handleAddTask = () => {
    if (!newTask.trim() || !minutes || !sortOrder) return;
    const task = {
      name: newTask,
      minutes: parseInt(minutes),
      sortOrder: parseInt(sortOrder),
      completed: false,
    };
    const updated = [...tasks, task].sort((a, b) => a.sortOrder - b.sortOrder);
    setTasks(updated);
    setNewTask('');
    setMinutes('');
    setSortOrder('');
  };

  const handleSortChange = (index, value) => {
    const updated = [...tasks];
    updated[index].sortOrder = parseInt(value);
    setTasks(updated.sort((a, b) => a.sortOrder - b.sortOrder));
  };

  const handleStart = () => {
    if (tasks.length === 0 || isRunning) return;
    setIsRunning(true);
    setTimeLeft(tasks[currentTaskIndex].minutes * 60);
    setView('timer');
  };

  const handleFinishEarly = () => {
    clearInterval(timerRef.current);
    markTaskComplete();
  };

  const markTaskComplete = () => {
    if (audioRef.current) audioRef.current.play();

    const updatedTasks = tasks.map((task, i) =>
      i === currentTaskIndex ? { ...task, completed: true } : task
    );
    setTasks(updatedTasks);
    setCompletedToday((prev) => prev + 1);
    updateHistory();

    setIsRunning(false);
    setCurrentTaskIndex((prev) => prev + 1);
    setView('tasks');
  };

  const updateHistory = () => {
    const today = new Date().toISOString().split('T')[0];
    const existing = history.find((h) => h.date === today);
    let updatedHistory;

    if (existing) {
      updatedHistory = history.map((h) =>
        h.date === today ? { ...h, count: h.count + 1 } : h
      );
    } else {
      updatedHistory = [...history, { date: today, count: 1 }];
      if (
        history.length > 0 &&
        new Date(today) - new Date(history[history.length - 1].date) === 86400000
      ) {
        setStreak((s) => {
          const newStreak = s + 1;
          localStorage.setItem('streak', newStreak);
          return newStreak;
        });
      } else {
        setStreak(1);
        localStorage.setItem('streak', '1');
      }
    }

    setHistory(updatedHistory);
    localStorage.setItem('history', JSON.stringify(updatedHistory));
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      clearInterval(timerRef.current);
      markTaskComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const formatTime = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;

  return (
    <div className="p-4 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Task Focus Timer</h1>
      {view === 'tasks' && (
        <>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="border p-2 flex-1"
            />
            <input
              type="number"
              placeholder="Min"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="border p-2 w-20"
            />
            <input
              type="number"
              placeholder="#"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border p-2 w-16"
            />
            <button
              onClick={handleAddTask}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>

          <ul className="space-y-2 mb-4">
            {tasks.map((task, i) => (
              <li
                key={i}
                className="border p-2 flex justify-between items-center bg-white"
              >
                <span>
                  {task.name} ({task.minutes}m){task.completed && ' ✅'}
                </span>
                <input
                  type="number"
                  value={task.sortOrder}
                  onChange={(e) => handleSortChange(i, e.target.value)}
                  className="border p-1 w-14 text-center"
                />
              </li>
            ))}
          </ul>

          <button
            onClick={handleStart}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Start Timer
          </button>

          <div className="mt-6">
            <p className="font-bold">Streak: {streak} days</p>
            <Line
              data={{
                labels: history.map((h) => h.date.slice(5)),
                datasets: [
                  {
                    label: 'Tasks Completed',
                    data: history.map((h) => h.count),
                    fill: false,
                    borderColor: 'blue',
                  },
                ],
              }}
              height={200}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </>
      )}

      {view === 'timer' && tasks[currentTaskIndex] && (
        <div className="space-y-4 mt-4">
          <h2 className="text-xl font-bold">{tasks[currentTaskIndex].name}</h2>
          <p className="text-2xl">{formatTime(timeLeft)}</p>
          <button
            onClick={handleFinishEarly}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Finish Early
          </button>
        </div>
      )}

      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-alert-alarm-1005.mp3" />
    </div>
  );
}

export default App;
