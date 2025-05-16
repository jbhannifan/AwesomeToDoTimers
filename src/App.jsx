import React, { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, task, time, onPlay, isRunning, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white p-3 rounded shadow mb-2 flex justify-between items-center"
    >
      <div {...listeners} className="cursor-grab mr-2">☰</div>
      <div className="flex-1">{task} - {time} min</div>
      <button
        onClick={onPlay}
        disabled={isRunning}
        className="bg-green-500 text-white px-2 py-1 rounded disabled:opacity-50"
      >▶</button>
      <button
        onClick={onRemove}
        className="bg-red-500 text-white px-2 py-1 ml-2 rounded"
      >✖</button>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [time, setTime] = useState('');
  const [currentIndex, setCurrentIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timeLeft <= 0 && currentIndex !== null) {
      clearInterval(timerRef.current);
      setCurrentIndex(null);
    }
  }, [timeLeft, currentIndex]);

  const handleAddTask = () => {
    if (task && time) {
      setTasks([...tasks, { id: crypto.randomUUID(), task, time: parseInt(time) }]);
      setTask('');
      setTime('');
    }
  };

  const handlePlay = (index) => {
    clearInterval(timerRef.current);
    setCurrentIndex(index);
    setTimeLeft(tasks[index].time * 60);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
  };

  const handleRemove = (index) => {
    const updated = [...tasks];
    updated.splice(index, 1);
    setTasks(updated);
    if (index === currentIndex) {
      clearInterval(timerRef.current);
      setCurrentIndex(null);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      setTasks((tasks) => arrayMove(tasks, oldIndex, newIndex));
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Task Focus Timer</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Task"
          className="flex-1 border p-2 rounded"
        />
        <input
          type="number"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Min"
          className="w-20 border p-2 rounded"
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <button onClick={handleAddTask} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      {currentIndex !== null && (
        <div className="mb-4 p-4 border rounded bg-yellow-100">
          <p>Now Working On: {tasks[currentIndex].task}</p>
          <p className="text-2xl">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((t, index) => (
            <SortableItem
              key={t.id}
              id={t.id}
              task={t.task}
              time={t.time}
              onPlay={() => handlePlay(index)}
              isRunning={currentIndex === index}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
