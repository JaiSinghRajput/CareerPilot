import express, { Router } from 'express';
import { clerkWebhookHandler } from '../controllers/webhook.controller.js';
const router = express.Router();
// The webhook handler needs the raw body to verify the signature
router.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhookHandler);
export default router;
//# sourceMappingURL=webhook.routes.js.map