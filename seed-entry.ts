import { seedDatabase } from './utils/seed';

// 暴露给 window 对象以便在控制台调用
(window as any).seedDatabase = seedDatabase;

console.log('Seed script loaded. Run window.seedDatabase() to populate data.');
