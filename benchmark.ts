const tasks = Array.from({ length: 10000 }, (_, i) => ({ title: `Task ${i}`, dueDate: '2026-06-22' }));
const newTasks = Array.from({ length: 1000 }, (_, i) => ({ title: `Task ${i + 5000}`, dueDate: '2026-06-22' }));

console.time('Baseline');
let added1 = 0;
for (const item of newTasks) {
  const exists = tasks.some(t => t.title === item.title && t.dueDate === item.dueDate);
  if (!exists) {
    added1++;
  }
}
console.timeEnd('Baseline');

console.time('Optimized');
let added2 = 0;
const existingTaskIds = new Set(tasks.map(t => `${t.title}|${t.dueDate}`));
for (const item of newTasks) {
  const exists = existingTaskIds.has(`${item.title}|${item.dueDate}`);
  if (!exists) {
    added2++;
  }
}
console.timeEnd('Optimized');
console.log(added1, added2);
