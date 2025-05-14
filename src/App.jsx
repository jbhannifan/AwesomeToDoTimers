import { useState } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [minutes, setMinutes] = useState("");
  const [showSummary, setShowSummary] = useState(false);

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

  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);

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
              </div>
            </li>
          ))}
        </ul>
        <p className="font-semibold mb-4">Total time: {totalMinutes} minutes</p>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
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
