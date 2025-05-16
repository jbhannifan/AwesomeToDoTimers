""import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputTask, setInputTask] = useState('');
  const [inputMinutes, setInputMinutes] = useState('');
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const inputRef = useRef(null);
  const minutesRef = useRef(null);
  const [sortPriorities, setSortPriorities] = useState({});

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Optional: Add celebration or sound here
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTimer = (seconds) => {
    setTimeLeft(seconds);
    setIsRunning(true);
  };

  const handleAddTask = () => {
    if (!inputTask.trim() || !inputMinutes.trim()) return;
    const newTask = {
      id: Date.now(),
      name: inputTask,
      minutes: parseInt(inputMinutes, 10),
    };
    setTasks(prev => [...prev, newTask]);
    setInputTask('');
    setInputMinutes('');
    inputRef.current.focus();
  };

  const handleSortChange = (e, taskId) => {
    const newValue = e.target.value;
    setSortPriorities(prev => ({ ...prev, [taskId]: newValue }));
  };

  const handleSortKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  const handleSortTasks = () => {
    const sorted = [...tasks].sort((a, b) => {
      const priorityA = parseInt(sortPriorities[a.id] || 0);
      const priorityB = parseInt(sortPriorities[b.id] || 0);
      return priorityA - priorityB;
    });
    setTasks(sorted);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Task Focus Timer</h1>

      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          value={inputTask}
          onChange={e => setInputTask(e.target.value)}
          placeholder="Task name"
          className="border p-2 flex-1 rounded"
        />
        <input
          ref={minutesRef}
          value={inputMinutes}
          onChange={e => setInputMinutes(e.target.value)}
          onKeyDown={handleSortKeyDown}
          placeholder="Minutes"
          className="border p-2 w-24 rounded"
          type="number"
        />
        <Button onClick={handleAddTask}>Add</Button>
      </div>

      {tasks.length > 0 && (
        <>
          <div className="mb-2">
            <Button onClick={handleSortTasks} className="text-sm">Sort</Button>
          </div>
          <ul className="space-y-2">
            {tasks.map(task => (
              <li key={task.id} className="border p-3 rounded flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={sortPriorities[task.id] || ''}
                    onChange={(e) => handleSortChange(e, task.id)}
                    onKeyDown={handleSortKeyDown}
                    className="w-12 border rounded p-1 text-center"
                    placeholder="#"
                  />
                  <span>{task.name} - {task.minutes} min</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startTimer(task.minutes * 60)}
                >
                  Start
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

      {isRunning && (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold">Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</h2>
        </div>
      )}
    </div>
  );
}
