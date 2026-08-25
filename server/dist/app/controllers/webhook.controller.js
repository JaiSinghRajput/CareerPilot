import express from 'express';
import { Webhook } from 'svix';
import db from '../../db/db.js';
import { usersTable } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
export const clerkWebhookHandler = async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        console.error('Missing CLERK_WEBHOOK_SECRET');
        res.status(500).json({ success: false, message: 'Server configuration error' });
        return;
    }
    // Get the headers from the request
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];
    // If there are missing svix headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        res.status(400).json({
            success: false,
            message: 'Error occured -- no svix headers',
        });
        return;
    }
    // Get the raw body
    // Since we use express.raw(), req.body is a Buffer. We need it as a string to verify.
    const payload = req.body.toString('utf8');
    const body = payload;
    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;
    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    }
    catch (err) {
        console.error('Error verifying webhook:', err);
        res.status(400).json({
            success: false,
            message: 'Error verifying webhook',
        });
        return;
    }
    // Handle the event
    const { id } = evt.data;
    const eventType = evt.type;
    try {
        if (eventType === 'user.created') {
            const email = evt.data.email_addresses?.[0]?.email_address;
            const firstName = evt.data.first_name || '';
            const lastName = evt.data.last_name || '';
            const name = `${firstName} ${lastName}`.trim();
            const imageUrl = evt.data.image_url;
            await db.insert(usersTable).values({
                clerkId: id,
                email: email || `no-email-${id}@example.com`,
                name: name || 'Unknown',
                profilePictureUrl: imageUrl,
            });
            console.log(`User ${id} inserted successfully`);
        }
        else if (eventType === 'user.updated') {
            const email = evt.data.email_addresses?.[0]?.email_address;
            const firstName = evt.data.first_name || '';
            const lastName = evt.data.last_name || '';
            const name = `${firstName} ${lastName}`.trim();
            const imageUrl = evt.data.image_url;
            await db
                .update(usersTable)
                .set({
                email: email || `no-email-${id}@example.com`,
                name: name || 'Unknown',
                profilePictureUrl: imageUrl,
                updatedAt: new Date(),
            })
                .where(eq(usersTable.clerkId, id));
            console.log(`User ${id} updated successfully`);
        }
        else if (eventType === 'user.deleted') {
            // Depending on your logic, you can delete or mark as inactive
            await db
                .update(usersTable)
                .set({
                isActive: false,
                updatedAt: new Date(),
            })
                .where(eq(usersTable.clerkId, id));
            console.log(`User ${id} marked as inactive successfully`);
        }
        res.status(200).json({ success: true, message: 'Webhook received' });
    }
    catch (dbError) {
        console.error('Database operation failed during webhook:', dbError);
        res.status(500).json({
            success: false,
            message: 'Database sync error',
            error: dbError.message || String(dbError)
        });
    }
};
//# sourceMappingURL=webhook.controller.js.map