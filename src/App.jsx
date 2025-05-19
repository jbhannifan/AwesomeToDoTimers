import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function TaskFocusTimer() {
  const [taskName, setTaskName] = useState('');
  const [taskOrder, setTaskOrder] = useState('');
  const [tasks, setTasks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      completeTask();
    }
    return () => clearTimeout(timerRef.current);
  }, [isRunning, timeLeft]);

  const addTask = () => {
    if (taskName.trim() && taskOrder.trim()) {
      const newTask = {
        id: Date.now(),
        name: taskName.trim(),
        order: parseInt(taskOrder),
        completed: false,
        timestamp: new Date().toISOString(),
      };
      const updatedTasks = [...tasks, newTask].sort((a, b) => a.order - b.order);
      setTasks(updatedTasks);
      setTaskName('');
      setTaskOrder('');
    }
  };

  const startTask = () => {
    if (tasks.length > 0 && !isRunning) {
      setTimeLeft(25 * 60); // 25 minutes
      setIsRunning(true);
    }
  };

  const completeTask = () => {
    const [completed, ...remaining] = tasks;
    if (completed) {
      setCompletedTasks([...completedTasks, completed]);
      setTasks(remaining);
    }
  };

  const stopEarly = () => {
    setIsRunning(false);
    completeTask();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">Task Focus Timer</h1>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Task name"
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Order"
          value={taskOrder}
          onChange={e => setTaskOrder(e.target.value)}
          className="w-20 border p-2 rounded"
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask} className="bg-green-500 text-white px-4 py-2 rounded">Add</button>
      </div>

      {tasks.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
          <ul className="space-y-1">
            {tasks.map(task => (
              <li key={task.id} className="border p-2 rounded bg-white flex justify-between items-center">
                <span>{task.order}. {task.name}</span>
              </li>
            ))}
          </ul>
          <button onClick={startTask} className="bg-blue-500 text-white px-4 py-2 rounded">Start Next Task</button>
        </div>
      )}

      {isRunning && (
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</h2>
          <button onClick={stopEarly} className="bg-red-500 text-white px-4 py-2 rounded">Finish Early</button>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Completed Tasks</h2>
          <ul className="space-y-1">
            {completedTasks.map(task => (
              <li key={task.id} className="line-through text-gray-500">{task.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TaskFocusTimer;
