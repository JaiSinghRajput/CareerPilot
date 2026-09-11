import dotenv from "dotenv";
dotenv.config();

const apifyToken = process.env.APIFY_API_TOKEN;
const linkedInUrl = "https://www.linkedin.com/in/jaisingh00/";

async function test() {
  const runRes = await fetch(`https://api.apify.com/v2/acts/LpVuK3Zozwuipa5bp/runs?token=${apifyToken}&waitForFinish=120`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profileScraperMode: "Profile details no email ($4 per 1k)",
      queries: [linkedInUrl]
    })
  });

  const runData = await runRes.json();
  const datasetId = runData.data.defaultDatasetId;
  const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`);
  const items = await datasetRes.text();
  
  console.log("Items:", items.substring(0, 1000));
}

test().catch(console.error);
