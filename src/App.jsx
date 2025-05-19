import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [minutes, setMinutes] = useState(25);
  const [sortOrder, setSortOrder] = useState(1);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const intervalRef = useRef(null);

  // Load completed tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('completedTasks');
    if (saved) setCompletedTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      completeCurrentTask();
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning, timeLeft]);

  const addTask = () => {
    if (!newTask.trim()) return;
    const newEntry = {
      text: newTask,
      minutes: parseInt(minutes, 10),
      order: parseInt(sortOrder, 10),
    };
    const updated = [...tasks, newEntry].sort((a, b) => a.order - b.order);
    setTasks(updated);
    setNewTask('');
    setMinutes(25);
    setSortOrder(tasks.length + 2);
  };

  const startTimer = (index) => {
    setCurrentTaskIndex(index);
    setTimeLeft(tasks[index].minutes * 60);
    setTimerRunning(true);
  };

  const finishEarly = () => {
    completeCurrentTask();
  };

  const completeCurrentTask = () => {
    if (currentTaskIndex === null) return;
    const task = tasks[currentTaskIndex];
    const now = new Date().toLocaleDateString();
    const updatedCompleted = [...completedTasks, { ...task, date: now }];
    setCompletedTasks(updatedCompleted);
    localStorage.setItem('completedTasks', JSON.stringify(updatedCompleted));

    const updatedTasks = tasks.filter((_, i) => i !== currentTaskIndex);
    setTasks(updatedTasks);
    setCurrentTaskIndex(null);
    setTimeLeft(0);
    setTimerRunning(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const dailySummary = () => {
    const today = new Date().toLocaleDateString();
    return completedTasks.filter(t => t.date === today);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Task Focus Timer</h1>
      <div className="flex gap-2 mb-4">
        <input
          className="border p-1 w-full"
          placeholder="Task name"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
        />
        <input
          type="number"
          className="border p-1 w-20"
          placeholder="Min"
          value={minutes}
          onChange={e => setMinutes(e.target.value)}
        />
        <input
          type="number"
          className="border p-1 w-20"
          placeholder="Order"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <button className="bg-blue-500 text-white px-3" onClick={addTask}>Add</button>
      </div>

      {tasks.length > 0 && (
        <ul className="mb-4">
          {tasks.map((task, i) => (
            <li key={i} className="flex justify-between items-center mb-2 border p-2">
              <div>
                <strong>{task.order}.</strong> {task.text} ({task.minutes} min)
              </div>
              {!timerRunning && (
                <button className="bg-green-500 text-white px-2" onClick={() => startTimer(i)}>Start</button>
              )}
            </li>
          ))}
        </ul>
      )}

      {timerRunning && (
        <div className="mb-4">
          <p className="text-xl">Time left: {formatTime(timeLeft)}</p>
          <button className="bg-red-500 text-white px-3 mt-2" onClick={finishEarly}>Finish Early</button>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Today's Completed Tasks</h2>
        <ul className="list-disc ml-6">
          {dailySummary().map((t, i) => (
            <li key={i}>{t.text} ({t.minutes} min)</li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-gray-500">Total: {dailySummary().reduce((sum, t) => sum + t.minutes, 0)} min</p>
      </div>
    </div>
  );
}

export default App;
