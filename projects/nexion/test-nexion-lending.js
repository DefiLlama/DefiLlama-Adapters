const sdk = require('@defillama/sdk');
const nexionAdapter = require('./index.js');

async function testNexionAdapter() {
    console.log("🔍 Testing Nexion Protocol Adapter...\n");

    const chain = 'pulse';
    const timestamp = Math.floor(Date.now() / 1000);

    try {
        // Create API object for PulseChain
        const api = new sdk.ChainApi({ chain, timestamp });

        console.log("📊 Testing TVL (Farm/Staking)...");
        const tvlResult = await nexionAdapter.pulse.tvl(timestamp, null, null, { api });
        console.log("TVL Result:", tvlResult);
        console.log("");

        console.log("🔒 Testing Staking...");
        const stakingApi = new sdk.ChainApi({ chain, timestamp });
        const stakingResult = await nexionAdapter.pulse.staking(timestamp, null, null, { api: stakingApi });
        console.log("Staking Result:", stakingResult);
        console.log("");

        console.log("💰 Testing Lending/Borrowed (Gearbox-style)...");
        const borrowedApi = new sdk.ChainApi({ chain, timestamp });
        const borrowedResult = await nexionAdapter.pulse.borrowed(borrowedApi);
        console.log("Borrowed Result:", borrowedResult);
        console.log("");

        console.log("✅ All tests completed successfully!");

    } catch (error) {
        console.error("❌ Test failed:");
        console.error("Error message:", error.message);
        console.error("Stack trace:", error.stack);
    }
}

// Run the test
testNexionAdapter();
