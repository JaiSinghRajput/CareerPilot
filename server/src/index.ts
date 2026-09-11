import 'dotenv/config';
import app from './app.js';



const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(error.name, error.message);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`Server is running successfully on port ${PORT}`);
});

process.on('unhandledRejection', (error: any) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(error.name, error.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
