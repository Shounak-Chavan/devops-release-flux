/**
 * Local Latency Benchmark & Bottleneck Test
 * Run this with: node benchmark.js
 */

const API_URL = 'http://127.0.0.1:8000/api/v1';
const API_KEY = 'ff_live_43f5145bef4c3b25b5afd22469847a91'; 
const FLAG_ID = 'a7bda0d5-19b9-476a-8c77-9c110d4983c1';

// Helper to measure execution time
const measureTime = async (fn) => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    return end - start;
};

// 1. Test the Read Path (SDK Ruleset Fetch)
// Expected behavior: First request takes ~50-100ms (DB fetch). Subsequent requests take < 5ms (Redis cache).
async function testReads() {
    console.log('\n--- 🚀 Testing READ Path (SDK Ruleset Fetch) ---');
    
    const fetchRuleset = async () => {
        const res = await fetch(`${API_URL}/sdk/ruleset`, { // Adjust to your actual endpoint path
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!res.ok) throw new Error(`Read failed: ${res.status}`);
    };

    // Cold Start (Cache Miss)
    const coldTime = await measureTime(fetchRuleset);
    console.log(`Cold Start (Cache Miss): ${coldTime.toFixed(2)} ms`);

    // Warm Start (Cache Hit)
    const warmTime = await measureTime(fetchRuleset);
    console.log(`Warm Start (Cache Hit): ${warmTime.toFixed(2)} ms`);

    // Concurrent Load (100 parallel SDKs connecting at once)
    const concurrentCount = 100;
    const loadTime = await measureTime(async () => {
        const promises = Array.from({ length: concurrentCount }, fetchRuleset);
        await Promise.all(promises);
    });
    console.log(`100 Concurrent Reads: ${loadTime.toFixed(2)} ms total (Avg: ${(loadTime / concurrentCount).toFixed(2)} ms/req)`);
}

// 2. Test the Write Path (Usage Tracking)
// Expected behavior: Since we push to a Redis buffer, these should be instant (< 5ms), even under load.
async function testWrites() {
    console.log('\n--- 📈 Testing WRITE Path (Usage Tracking) ---');
    
    const trackUsage = async () => {
        const res = await fetch(`${API_URL}/usage/track`, { // Adjust to your actual endpoint path
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                flagId: FLAG_ID,
                status: true
            })
        });
        if (!res.ok) throw new Error(`Write failed: ${res.status}`);
    };

    // Single Write
    const singleTime = await measureTime(trackUsage);
    console.log(`Single Write (Redis Buffer Push): ${singleTime.toFixed(2)} ms`);

    // High Throughput Load (1000 flag evaluations tracked simultaneously)
    const concurrentCount = 1000;
    const loadTime = await measureTime(async () => {
        const promises = Array.from({ length: concurrentCount }, trackUsage);
        await Promise.all(promises);
    });
    console.log(`1000 Concurrent Writes: ${loadTime.toFixed(2)} ms total (Avg: ${(loadTime / concurrentCount).toFixed(2)} ms/req)`);
}

// Run tests sequentially
async function run() {
    try {
        await testReads();
        await testWrites();
        console.log('\n✅ All tests complete.');
        console.log('⏳ Now wait up to 60 seconds and check your server logs to see the background worker process the 1001 batched usage events into Postgres!');
    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
    }
}

run();