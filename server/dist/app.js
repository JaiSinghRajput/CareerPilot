import express from 'express';
import cors from 'cors';
import routes from './app/routes/index.js';
import webhookRoutes from './app/routes/webhook.routes.js';
import { clerkMiddleware } from '@clerk/express';
const app = express();
// Middleware
app.use(cors());
// Webhook Routes (must be placed before express.json() to parse raw body)
app.use('/api/v1/webhooks', webhookRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    secretKey: process.env.CLERK_SECRET_KEY || ''
}));
// Application Routes
app.use('/api/v1', routes);
// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to CareerPilot API',
    });
});
// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});
// Not Found Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        errorMessages: [
            {
                path: req.originalUrl,
                message: 'API Route not found',
            },
        ],
    });
});
// Global Error Handler
app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        errorMessages: error.errorMessages || [],
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
});
export default app;
//# sourceMappingURL=app.js.map