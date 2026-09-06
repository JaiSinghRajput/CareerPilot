import { db } from './src/db/index.js';
import { jobRecommendationsTable } from './src/db/schema.js';

async function run() {
  const cache = await db.select().from(jobRecommendationsTable).limit(1);
  if (cache.length > 0) {
    const jobs = cache[0].jobs as any;
    if (jobs && jobs.jobs && jobs.jobs.length > 0) {
      console.log(JSON.stringify(jobs.jobs[0], null, 2));
    } else {
      console.log("No jobs in cache array.");
    }
  } else {
    console.log("No cache found.");
  }
  process.exit(0);
}
run();
