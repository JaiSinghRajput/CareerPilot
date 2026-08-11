import 'dotenv/config';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';

// By providing the generic-less NodePgDatabase type, we satisfy TS2883 
// without triggering the schema type mismatch error.
const db: NodePgDatabase = drizzle(process.env.DATABASE_URL!);
export default db;
