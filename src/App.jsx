import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [minutes, setMinutes] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

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
    const sorted = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);
    setTasks(sorted);
    setCurrentTaskIndex(0);
    setIsRunning(true);
    setTimeLeft(sorted[0].minutes * 60);
  };

  const handleFinishEarly = () => {
    clearInterval(timerRef.current);
    markTaskComplete();
  };

  const markTaskComplete = () => {
    const updatedTasks = tasks.map((task, idx) =>
      idx === currentTaskIndex ? { ...task, completed: true } : task
    );
    const nextIndex = currentTaskIndex + 1;
    setTasks(updatedTasks);
    if (nextIndex < updatedTasks.length) {
      setCurrentTaskIndex(nextIndex);
      setTimeLeft(updatedTasks[nextIndex].minutes * 60);
    } else {
      setIsRunning(false);
    }
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
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

  const currentTask = tasks[currentTaskIndex];

  return (
    <div className="p-4 max-w-xl mx-auto">
      <audio ref={audioRef} src="https://www.soundjay.com/buttons/sounds/button-3.mp3" preload="auto" />
      
      {isRunning && currentTask ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{currentTask.name}</h2>
          <p className="text-4xl mb-4">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>
          <button onClick={handleFinishEarly} className="text-red-500 underline">
            Finish Early
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default App;
