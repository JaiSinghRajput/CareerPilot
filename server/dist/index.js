import app from './app.js';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;
process.on('uncaughtException', (error) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(error.name, error.message);
    process.exit(1);
});
const server = app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
process.on('unhandledRejection', (error) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(error.name, error.message);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
});
//# sourceMappingURL=index.js.map