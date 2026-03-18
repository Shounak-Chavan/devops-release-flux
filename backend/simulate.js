// Replace this with your actual copied API Key from the dashboard!
const API_KEY = "ff_live_43f5145bef4c3b25b5afd22469847a91"; 

// Your backend SDK endpoint
const API_URL = "http://localhost:8000/api/v1/sdk/evaluate";

// How many requests to send
const TOTAL_REQUESTS = 500; 

async function simulateTraffic() {
    console.log(`🚀 Blasting ${TOTAL_REQUESTS} requests to the FeatureFlow backend...`);
    
    let successCount = 0;
    let failCount = 0;

    // We generate an array of promises to fire them off concurrently
    const requests = Array.from({ length: TOTAL_REQUESTS }).map(async (_, index) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    // Simulating a random user context for the targeting rules
                    context: { 
                        userId: `user_${Math.floor(Math.random() * 10000)}`,
                        plan: index % 2 === 0 ? 'pro' : 'free',
                        city: index % 3 === 0 ? 'Mumbai' : 'Pune'
                    }
                })
            });

            if (response.ok) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            failCount++;
        }
    });

    // Wait for all requests to finish
    await Promise.all(requests);

    console.log(`✅ Simulation Complete!`);
    console.log(`📈 Successful Evaluations: ${successCount}`);
    if (failCount > 0) console.log(`❌ Failed Requests: ${failCount}`);
    console.log(`\n👉 Go check your frontend dashboard!`);
}

simulateTraffic();