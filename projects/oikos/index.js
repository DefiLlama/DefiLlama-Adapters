const { Web3 } = require('web3'); // Corrected import
const { BigNumber } = require('bignumber.js');
const https = require('https'); // For SSL verification (optional)

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

// FeePool ABI for `totalFeesAvailable()` function (ONLY IF YOU PLAN TO KEEP IT IN CONSOLE.LOG)
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

// Initialize Web3 with a BSC provider
const agent = new https.Agent({ rejectUnauthorized: false }); // Disables SSL verification (optional)
const web3 = new Web3('https://rpc.ankr.com/bsc', { agent }); // Updated RPC endpoint

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

// TVL Calculation
async function tvl() {
    console.log("🚨 Inside TVL Function...");
    console.log("🚀 Starting TVL calculation...");
    let totalTVL = new BigNumber(0);

    for (const synth of SYNTHS) {
        console.log(`🔍 Attempting to fetch total supply for ${synth.symbol} at address ${synth.address}`);

        try {
            const contract = new web3.eth.Contract(SYNTH_ABI, synth.address);
            const totalSupply = await contract.methods.totalSupply().call();

            console.log(`✅ ${synth.symbol} Total Supply Retrieved: ${totalSupply}`);
            
            // Correctly handle decimals
            const supplyInUnits = new BigNumber(totalSupply).dividedBy(10 ** synth.decimals);
            totalTVL = totalTVL.plus(supplyInUnits);

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

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    bsc: {
        tvl
    },
    methodology:
        "TVL is calculated by summing token balances from multiple Synth contracts and Collateral contracts."
};

console.log("✅ Adapter Loaded Successfully");
