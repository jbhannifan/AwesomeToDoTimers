import { useState } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [minutes, setMinutes] = useState("");

  function addTask() {
    if (!taskName || !minutes) return;
    setTasks([...tasks, { name: taskName, minutes: parseInt(minutes) }]);
    setTaskName("");
    setMinutes("");
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
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={addTask}
      >
        Add Task
      </button>

      <ul>
        {tasks.map((task, i) => (
          <li key={i} className="mb-2">
            {task.name} – {task.minutes} min
          </li>
        ))}
      </ul>
    </div>
  );
}
