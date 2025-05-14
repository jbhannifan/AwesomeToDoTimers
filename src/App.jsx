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

const soundFiles = {
  none: null,
  chime: "/chime.mp3",
  ding: "/ding.mp3",
  pop: "/pop.mp3"
};

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
  const [sound, setSound] = useState("chime");
  const [quote, setQuote] = useState("");

  const taskInputRef = useRef(null);
  const endTimeRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    localStorage.setItem("dailyGoal", dailyGoal);
  }, [dailyGoal]);

  function playSound() {
    if (sound !== "none" && soundFiles[sound]) {
      const audio = new Audio(soundFiles[sound]);
      audio.play();
    }
  }

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
    triggerConfetti();
    playSound();
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }

  function stopTimer() {
    setTimerRunning(false);
    setActiveTaskIndex(null);
    setSecondsLeft(0);
  }

  function triggerConfetti() {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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
  const completedTotal = completedTasks.reduce((sum, t) => sum + t.minutes, 0);

  const today = new Date().toISOString().slice(0, 10);
  const todayCompleted = completedTasks
    .filter((t) => t.date === today)
    .reduce((sum, t) => sum + t.minutes, 0);

  const groupedCompleted = completedTasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});

  const summaryData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const total = completedTasks
      .filter((t) => t.date === dateStr)
      .reduce((sum, t) => sum + t.minutes, 0);
    return { date: dateStr.slice(5), minutes: total };
  });

  if (timerRunning && activeTaskIndex !== null) {
    const currentTask = tasks[activeTaskIndex];
    const min = Math.floor(secondsLeft / 60);
    const sec = secondsLeft % 60;
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center">
        <h2 className="text-2xl mb-4">Current Task</h2>
        <h1 className="text-4xl font-bold mb-6">{currentTask.name}</h1>
        <div className="text-6xl font-mono mb-6">
          {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
        </div>
        <button
          className="bg-red-500 px-6 py-3 rounded text-white"
          onClick={completeTask}
        >
          Finish Early
        </button>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Task List</h1>
        <ul className="mb-4">
          {tasks.map((task, i) => (
            <li key={i} className="flex items-center justify-between mb-1">
              <span>{task.name} – {task.minutes} min</span>
              <div className="space-x-1">
                <button onClick={() => moveTask(i, -1)} className="bg-gray-200 px-2 rounded">⬆️</button>
                <button onClick={() => moveTask(i, 1)} className="bg-gray-200 px-2 rounded">⬇️</button>
                <button onClick={() => startTimer(i)} className="bg-green-500 text-white px-2 rounded">▶️</button>
              </div>
            </li>
          ))}
        </ul>
        <p className="font-semibold mb-2">Remaining: {totalMinutes} min</p>
        <p className="font-semibold mb-2 text-green-600">Completed: {completedTotal} min</p>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Daily Goal (min):</label>
          <input
            type="number"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(parseInt(e.target.value))}
            className="border p-2 w-full mb-1"
          />
          <p className="text-sm">
            Today: {todayCompleted} of {dailyGoal} min ({Math.round((todayCompleted / dailyGoal) * 100) || 0}%)
          </p>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Celebration Sound:</label>
          <select value={sound} onChange={(e) => setSound(e.target.value)} className="border p-2 w-full">
            <option value="chime">Chime</option>
            <option value="ding">Ding</option>
            <option value="pop">Pop</option>
            <option value="none">None</option>
          </select>
        </div>

        {quote && <p className="italic text-center text-blue-500 mt-2">“{quote}”</p>}

        <h2 className="font-bold mt-6 mb-2">Last 7 Days</h2>
        <div className="w-full h-48 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="minutes" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {Object.keys(groupedCompleted).length > 0 && (
          <div className="mt-4">
            <h2 className="font-bold mb-2">Finished Tasks</h2>
            {Object.entries(groupedCompleted).map(([date, items]) => (
              <div key={date} className="mb-3">
                <h3 className="font-semibold underline mb-1">{date}</h3>
                <ul>
                  {items.map((task, i) => (
                    <li key={i}>{task.name} – {task.minutes} min</li>
                  ))}
                </ul>
              </div>
            ))}
            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => {
                if (confirm("Clear all completed tasks?")) {
                  setCompletedTasks([]);
                  localStorage.removeItem("completedTasks");
                }
              }}
            >
              Clear History
            </button>
          </div>
        )}

        <button
          className="bg-gray-500 text-white px-4 py-2 mt-4 rounded"
          onClick={() => setShowSummary(false)}
        >
          Add More Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo Timer</h1>
      <input
        ref={taskInputRef}
        className="border p-2 mb-2 w-full"
        placeholder="Task name"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
      />
      <input
        className="border p-2 mb-2 w-full"
        placeholder="Minutes"
        type="number"
        value={minutes}
        onChange={(e) => setMinutes(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") addTask();
        }}
      />
      <div className="flex gap-2 mb-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={addTask}>Add Task</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setShowSummary(true)}>Finished Entering</button>
      </div>
      <ul>
        {tasks.map((task, i) => (
          <li key={i} className="mb-1">{task.name} – {task.minutes} min</li>
        ))}
      </ul>
    </div>
  );
}
