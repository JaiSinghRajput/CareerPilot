import { getAuth } from '@clerk/express';
export const requireAuth = (req, res, next) => {
    const auth = getAuth(req);
    console.log("--- AUTH DEBUG ---");
    console.log("Headers:", req.headers.authorization);
    console.log("Auth Object:", auth);
    console.log("------------------");
    if (!auth?.userId) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
    }
    next();
};
//# sourceMappingURL=auth.js.map