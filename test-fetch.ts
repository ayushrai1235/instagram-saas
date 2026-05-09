import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testFetch() {
  const url = process.env.DATABASE_URL!;
  console.log("URL:", url);
  
  // parse the URL
  const u = new URL(url);
  const hostname = u.hostname;
  
  try {
    const res = await fetch(`https://${hostname}/sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Neon-Connection-String": url,
        "Neon-Raw-Text-Output": "true"
      },
      body: JSON.stringify({ query: "SELECT 1 as val" })
    });
    console.log("Status:", res.status);
    console.log("Text:", await res.text());
  } catch (err) {
    console.error("Manual Fetch Error:", err);
  }
}
testFetch();
