import { useState, useEffect } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskMinutes, setTaskMinutes] = useState('');
  const [taskOrder, setTaskOrder] = useState('');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const handleAddTask = () => {
    if (!taskName || !taskMinutes) return;
    const newTask = {
      name: taskName,
      minutes: parseInt(taskMinutes),
      order: parseInt(taskOrder) || tasks.length + 1,
    };
    setTasks([...tasks, newTask]);
    setTaskName('');
    setTaskMinutes('');
    setTaskOrder('');
  };

  const handleReorder = (index, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].order = parseInt(value) || 0;
    setTasks(updatedTasks);
  };

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const startTask = (index) => {
    setCurrentTaskIndex(index);
    setTimeLeft(sortedTasks[index].minutes * 60);
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      setIsRunning(false);
    }
  }, [timeLeft, isRunning]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Task Focus Timer</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="border p-2 flex-1"
        />
        <input
          type="number"
          placeholder="Minutes"
          value={taskMinutes}
          onChange={(e) => setTaskMinutes(e.target.value)}
          className="border p-2 w-24"
        />
        <input
          type="number"
          placeholder="#"
          value={taskOrder}
          onChange={(e) => setTaskOrder(e.target.value)}
          className="border p-2 w-16"
        />
        <button onClick={handleAddTask} className="bg-blue-500 text-white px-4 py-2">
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {sortedTasks.map((task, index) => (
          <li
            key={index}
            className="border p-2 rounded flex justify-between items-center gap-2"
          >
            <div className="flex-1">
              <strong>{task.name}</strong> ({task.minutes} min)
            </div>
            <input
              type="number"
              className="w-12 border px-2 py-1 text-center"
              value={task.order}
              onChange={(e) => handleReorder(index, e.target.value)}
            />
            <button
              onClick={() => startTask(index)}
              className="bg-green-500 text-white px-3 py-1"
            >
              Start
            </button>
          </li>
        ))}
      </ul>

      {currentTaskIndex !== null && (
        <div className="mt-6 p-4 bg-yellow-100 border rounded text-center">
          <h2 className="text-xl font-semibold mb-2">
            Current Task: {sortedTasks[currentTaskIndex]?.name || '—'}
          </h2>
          <div className="text-3xl">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  );
}
