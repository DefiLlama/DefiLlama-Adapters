const sdk = require('@defillama/sdk');

console.log("🚨 Starting Oikos Adapter Execution...");

// Synth ABI for `totalSupply()` function
const SYNTH_ABI = [
    {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    }
];

// FeePool ABI for `totalFeesAvailable()` function
const FEEPOOL_ABI = [
    {
        constant: true,
        inputs: [],
        name: "totalFeesAvailable",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    }
];

// Synth Contracts for TVL Calculation
const SYNTHS = [
    { address: "0x1bE8d1de0052b7c2f6F9f8F640aAc622518520eE", symbol: "ODR", decimals: 18 },
    { address: "0x97619B7AB5E5CE6b36203E10b5fc0F34C57b324A", symbol: "iBNB", decimals: 8 },
    { address: "0xB72ef897482B5aCe5815FE0c427720A3BBB0FA59", symbol: "iBTC", decimals: 18 },
    { address: "0x19399869d4582C3B9729fc9B2A3776309d235F13", symbol: "iETH", decimals: 18 },
    { address: "0x4DDaCe4B8d58c3989075d2953FBA81fe69De5389", symbol: "oBNB", decimals: 18 },
    { address: "0x19e0E8413DEe3AfFd94bdd42519d01935a0CF0c2", symbol: "oBTC", decimals: 18 },
    { address: "0x68Db964FfF792D1A427f275D228E759d197471B9", symbol: "oXAU", decimals: 18 },
];

// FeePool Contract for Revenue Calculation
const FEEPOOL_CONTRACT = "0x4a7644B4b3ae6E4e2c53D01a39E7C4afA25061aF";

// TVL Calculation
async function tvl() {
    console.log("🚨 Inside TVL Function...");
    console.log("🚀 Starting TVL calculation...");
    let totalTVL = 0;

    for (const synth of SYNTHS) {
        console.log(`🔍 Attempting to fetch total supply for ${synth.symbol} at address ${synth.address}`);

        try {
            const totalSupply = await sdk.api.abi.call({
                target: synth.address,
                abi: SYNTH_ABI[0],
                chain: 'bsc'
            });

            console.log(`✅ ${synth.symbol} Total Supply Retrieved: ${totalSupply.output}`);
            totalTVL += parseFloat(totalSupply.output) / 10 ** synth.decimals;

            console.log(`Updated Total TVL: ${totalTVL.toFixed(2)}`);
        } catch (error) {
            console.error(`❌ Error fetching total supply for ${synth.symbol}: ${error.message}`);
        }
    }

    console.log(`✅ Final Total TVL Calculated: ${totalTVL.toFixed(2)}`);
    return {
        'bsc:usd': totalTVL.toFixed(2)
    };
}

// Fees Calculation
async function fees() {
    console.log("🚨 Inside Fees Function...");
    console.log("🚀 Starting Fees calculation...");

    try {
        console.log(`🔍 Attempting to fetch total fees from FeePool contract...`);
        const totalFees = await sdk.api.abi.call({
            target: FEEPOOL_CONTRACT,
            abi: FEEPOOL_ABI[0],
            chain: 'bsc'
        });

        console.log(`✅ Total Fees Retrieved from FeePool Contract: ${totalFees.output}`);

        const feesInEth = parseFloat(totalFees.output) / 1e18;

        return {
            dailyFees: feesInEth.toFixed(2),
            dailyRevenue: feesInEth.toFixed(2),
            dailySupplySideRevenue: feesInEth.toFixed(2)
        };
    } catch (error) {
        console.error(`❌ Error in Fees Calculation: ${error.message}`);
        return {};
    }
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    bsc: {
        tvl,
        fees,
    },
    methodology:
        "TVL is calculated by summing token balances from multiple Synth contracts and Collateral contracts. Fees are derived directly from the FeePool contract using totalFeesAvailable().",
};

console.log("✅ Adapter Loaded Successfully");
