const { performance } = require('perf_hooks');

const tasks = Array.from({ length: 10000 }, (_, i) => ({
  title: `Task ${i}`,
  dueDate: `2026-06-15`
}));

const newTasks = Array.from({ length: 5000 }, (_, i) => ({
  title: `Task ${i + 5000}`,
  dueDate: `2026-06-15`
}));

// Baseline
const startBaseline = performance.now();
for (const item of newTasks) {
  const exists = tasks.some(t => t.title === item.title && t.dueDate === item.dueDate);
  if (!exists) {
    // simulate add
  }
}
const endBaseline = performance.now();
console.log(`Baseline (O(N*M)): ${endBaseline - startBaseline} ms`);

// Optimized
const startOptimized = performance.now();
const taskSet = new Set(tasks.map(t => `${t.title}|${t.dueDate}`));
for (const item of newTasks) {
  const exists = taskSet.has(`${item.title}|${item.dueDate}`);
  if (!exists) {
    // simulate add
  }
}
const endOptimized = performance.now();
console.log(`Optimized (O(N+M)): ${endOptimized - startOptimized} ms`);
