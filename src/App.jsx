import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

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

  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  }, [completedTasks]);

  function addTask() {
    if (!taskName || !minutes) return;
    setTasks([...tasks, { name: taskName, minutes: parseInt(minutes) }]);
    setTaskName("");
    setMinutes("");
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
    setTimerRunning(true);
  }

  function completeTask() {
    if (activeTaskIndex === null) return;
    const finishedTask = tasks[activeTaskIndex];
    setCompletedTasks([...completedTasks, finishedTask]);
    const remaining = tasks.filter((_, i) => i !== activeTaskIndex);
    setTasks(remaining);
    setActiveTaskIndex(null);
    setSecondsLeft(0);
    setTimerRunning(false);
    triggerConfetti();
  }

  function stopTimer() {
    setTimerRunning(false);
    setActiveTaskIndex(null);
    setSecondsLeft(0);
  }

  function triggerConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          completeTask();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const completedTotal = completedTasks.reduce((sum, t) => sum + t.minutes, 0);

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
                <button
                  onClick={() => moveTask(i, -1)}
                  className="bg-gray-200 px-2 rounded"
                >
                  ⬆️
                </button>
                <button
                  onClick={() => moveTask(i, 1)}
                  className="bg-gray-200 px-2 rounded"
                >
                  ⬇️
                </button>
                <button
                  onClick={() => startTimer(i)}
                  className="bg-green-500 text-white px-2 rounded"
                >
                  ▶️
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p className="font-semibold mb-2">Remaining: {totalMinutes} min</p>
        <p className="font-semibold mb-4 text-green-600">
          Completed: {completedTotal} min
        </p>
        {completedTasks.length > 0 && (
          <div className="mt-4">
            <h2 className="font-bold mb-2">Finished Tasks</h2>
            <ul>
              {completedTasks.map((task, i) => (
                <li key={i}>{task.name} – {task.minutes} min</li>
              ))}
            </ul>
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
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addTask}
        >
          Add Task
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setShowSummary(true)}
        >
          Finished Entering
        </button>
      </div>

      <ul>
        {tasks.map((task, i) => (
          <li key={i} className="mb-1">
            {task.name} – {task.minutes} min
          </li>
        ))}
      </ul>
    </div>
  );
}
