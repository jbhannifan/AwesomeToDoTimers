// Full App.jsx with streak tracker and UI restored
import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const motivationalQuotes = [
  "Great job! Keep going!",
  "You’re on fire today!",
  "Every step counts!",
  "Progress is progress!",
  "Another one done — nice work!"
];

const chime = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
chime.volume = 0.3;

function SortableTask({ task, id, index, onStart }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex justify-between items-center bg-gray-100 p-3 rounded shadow-sm"
    >
      <div className="cursor-grab text-gray-500 mr-2" {...listeners}>⠿</div>
      <div className="flex-1">
        <strong>{task.name}</strong>
        <span className="ml-2 text-sm text-gray-600">({task.minutes} min)</span>
      </div>
      <button
        onClick={() => onStart(index)}
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >▶</button>
    </li>
  );
}

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
  const [streak, setStreak] = useState(() => {
    const stored = localStorage.getItem("streakInfo");
    return stored ? JSON.parse(stored) : { count: 0, lastDate: null };
  });

  const taskInputRef = useRef(null);
  const endTimeRef = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    localStorage.setItem("dailyGoal", dailyGoal);
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem("streakInfo", JSON.stringify(streak));
  }, [streak]);

  function updateStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const todayTotal = completedTasks
      .filter((t) => t.date === today)
      .reduce((sum, t) => sum + t.minutes, 0);
    if (todayTotal >= dailyGoal && streak.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      setStreak({
        count: streak.lastDate === yesterday ? streak.count + 1 : 1,
        lastDate: today,
      });
    }
  }

  function addTask() {
    if (!taskName || !minutes) return;
    setTasks([...tasks, { name: taskName, minutes: parseInt(minutes) }]);
    setTaskName("");
    setMinutes("");
    setTimeout(() => taskInputRef.current?.focus(), 0);
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
    const updated = [...completedTasks, finishedTask];
    setCompletedTasks(updated);
    updateStreak();
    const remaining = tasks.filter((_, i) => i !== activeTaskIndex);
    setTasks(remaining);
    setActiveTaskIndex(null);
    setSecondsLeft(0);
    setTimerRunning(false);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    chime.play();
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

  const chartData = Object.values(
    completedTasks.reduce((acc, task) => {
      acc[task.date] = acc[task.date] || { date: task.date, minutes: 0 };
      acc[task.date].minutes += task.minutes;
      return acc;
    }, {})
  ).sort((a, b) => a.date.localeCompare(b.date));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t, i) => i.toString() === active.id);
    const newIndex = tasks.findIndex((t, i) => i.toString() === over.id);
    setTasks(arrayMove(tasks, oldIndex, newIndex));
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-blue-600">Task Focus Timer</h1>
        <p className="text-gray-600">Stay productive. One task at a time.</p>
        <p className="text-green-600 font-semibold mt-2">🔥 Streak: {streak.count} day{streak.count === 1 ? "" : "s"}</p>
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tasks.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {tasks.map((task, i) => (
                <SortableTask key={i} id={i.toString()} task={task} index={i} onStart={startTimer} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
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
