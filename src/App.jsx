import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const getToday = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskMinutes, setTaskMinutes] = useState('');
  const [taskRank, setTaskRank] = useState('');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(() => {
    const stored = localStorage.getItem('completedTasks');
    return stored ? JSON.parse(stored) : {};
  });
  const timerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && currentTaskIndex !== null) {
      markTaskComplete(currentTaskIndex);
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, currentTaskIndex]);

  const addTask = () => {
    if (!taskName || !taskMinutes || !taskRank) return;
    const newTask = {
      name: taskName,
      minutes: parseInt(taskMinutes),
      rank: parseInt(taskRank),
      completed: false,
    };
    setTasks(prev => [...prev, newTask].sort((a, b) => a.rank - b.rank));
    setTaskName('');
    setTaskMinutes('');
    setTaskRank('');
  };

  const startTask = index => {
    setCurrentTaskIndex(index);
    setTimeLeft(tasks[index].minutes * 60);
  };

  const markTaskComplete = index => {
    const today = getToday();
    const updated = [...tasks];
    updated[index].completed = true;
    setTasks(updated);
    setCurrentTaskIndex(null);
    setTimeLeft(0);
    setCompletedTasks(prev => ({
      ...prev,
      [today]: [...(prev[today] || []), updated[index].name]
    }));
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <h1 className="text-xl font-bold">Task Focus Timer</h1>
          <div className="grid grid-cols-3 gap-2">
            <input
              className="border p-2"
              placeholder="Task"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
            />
            <input
              className="border p-2"
              placeholder="Minutes"
              type="number"
              value={taskMinutes}
              onChange={e => setTaskMinutes(e.target.value)}
            />
            <input
              className="border p-2"
              placeholder="Rank"
              type="number"
              value={taskRank}
              onChange={e => setTaskRank(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
            />
          </div>
          <Button onClick={addTask}>Add Task</Button>
        </CardContent>
      </Card>

      {tasks.map((task, i) => (
        <Card key={i} className={task.completed ? 'opacity-50' : ''}>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{task.name}</div>
              <div className="text-sm text-gray-500">{task.minutes} min (Rank {task.rank})</div>
            </div>
            {currentTaskIndex === i ? (
              <div>
                <div className="text-lg font-mono">{Math.floor(timeLeft / 60)}:{('0' + timeLeft % 60).slice(-2)}</div>
                <Button variant="outline" onClick={() => markTaskComplete(i)}>Finish Early</Button>
              </div>
            ) : (
              !task.completed && <Button onClick={() => startTask(i)}>Start</Button>
            )}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold mb-2">Daily Summary</h2>
          {Object.entries(completedTasks).map(([date, items]) => (
            <div key={date} className="text-sm">
              <strong>{date}:</strong> {items.join(', ')}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
