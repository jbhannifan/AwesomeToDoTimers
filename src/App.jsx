import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const motivationalQuotes = [
  "Great job! Keep going!",
  "You’re on fire today!",
  "Every step counts!",
  "Progress is progress!",
  "Another one done — nice work!"
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem("completedTasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [taskName, setTaskName] = useState("");
  const [minutes, setMinutes] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [activeTaskIndex, setActiveTaskIndex] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem("dailyGoal");
    return saved ? parseInt(saved) : 90;
  });
  const [quote, setQuote] = useState("");

  const taskInputRef = useRef(null);
  const endTimeRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    localStorage.setItem("dailyGoal", dailyGoal);
  }, [dailyGoal]);

  function addTask() {
    if (!taskName || !minutes) return;
    setTasks([...tasks, { name: taskName, minutes: parseInt(minutes) }]);
    setTaskName("");
    setMinutes("");
    setTimeout(() => taskInputRef.current?.focus(), 0);
  }

  function moveTask(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= tasks.length) return;
    const updated = [...tasks];
    const temp = updated[newIndex];
    updated[newIndex] = updated[index];
    updated[index] = temp;
    setTasks(updated);
  }

  function startTimer(index) {
    const seconds = tasks[index].minutes * 60;
    setActiveTaskIndex(index);
    setSecondsLeft(seconds);
    endTimeRef.current = Date.now() + seconds * 1000;
    setTimerRunning(true);
  }

  function completeTask() {
    if (activeTaskIndex === null) return;
    const finishedTask = {
      ...tasks[activeTaskIndex],
      date: new Date().toISOString().slice(0, 10),
    };
    setCompletedTasks([...completedTasks, finishedTask]);
    const remaining = tasks.filter((_, i) => i !== activeTaskIndex);
    setTasks(remaining);
    setActiveTaskIndex(null);
    setSecondsLeft(0);
    setTimerRunning(false);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }

  function stopTimer() {
    setTimerRunning(false);
    setActiveTaskIndex(null);
    setSecondsLeft(0);
  }

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        completeTask();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-2">Task Focus Timer</h1>
        <p className="text-gray-600">Stay productive. One task at a time.</p>
      </header>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <input
          ref={taskInputRef}
          className="border p-2 mb-2 w-full rounded"
          placeholder="Task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <input
          className="border p-2 mb-2 w-full rounded"
          placeholder="Minutes"
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTask();
          }}
        />
        <div className="flex gap-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={addTask}>Add Task</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => setShowSummary(true)}>Finished Entering</button>
        </div>
      </div>

      {tasks.length > 0 && (
        <ul className="space-y-2">
          {tasks.map((task, i) => (
            <li key={i} className="flex justify-between items-center bg-gray-100 p-3 rounded shadow-sm">
              <div>
                <strong>{task.name}</strong>
                <span className="ml-2 text-sm text-gray-600">({task.minutes} min)</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => moveTask(i, -1)} className="text-gray-500 hover:text-gray-800">⬆️</button>
                <button onClick={() => moveTask(i, 1)} className="text-gray-500 hover:text-gray-800">⬇️</button>
                <button onClick={() => startTimer(i)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">▶</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {timerRunning && activeTaskIndex !== null && (
        <div className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black text-white z-50">
          <h2 className="text-3xl font-bold mb-2">{tasks[activeTaskIndex].name}</h2>
          <div className="text-6xl font-mono mb-4">
            {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
          </div>
          <button onClick={completeTask} className="bg-red-500 px-6 py-2 rounded text-white">Finish Early</button>
        </div>
      )}

      {quote && (
        <div className="mt-6 text-center italic text-blue-600">
          “{quote}”
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-400">
        {totalMinutes > 0 && <p>Total remaining: {totalMinutes} min</p>}
      </div>
    </div>
  );
}
