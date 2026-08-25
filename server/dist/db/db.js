import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
// By providing the generic-less NodePgDatabase type, we satisfy TS2883 
// without triggering the schema type mismatch error.
const db = drizzle(process.env.DATABASE_URL);
export default db;
//# sourceMappingURL=db.js.map