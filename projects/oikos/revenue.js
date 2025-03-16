const { JsonRpcProvider, Contract } = require('ethers');
const feePoolABI = require('./FeePoolABI.json');

const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/'); // BSC Mainnet RPC
const FEEPOOL_ADDRESS = "0x4a7644B4b3ae6E4e2c53D01a39E7C4afA25061aF";

const feePoolContract = new Contract(FEEPOOL_ADDRESS, feePoolABI, provider);

async function fetch() {
    console.log("Starting revenue data retrieval for Oikos...");

    const totalRevenue = await feePoolContract.totalFees();

    return {
        dailyFees: (parseFloat(totalRevenue) / 1e18).toFixed(2),
        dailyRevenue: (parseFloat(totalRevenue) / 1e18).toFixed(2),
        dailySupplySideRevenue: (parseFloat(totalRevenue) / 1e18).toFixed(2),
    };
}

module.exports = {
    bsc: {
        fetch,
    },
    methodology: "Revenue is calculated directly from the FeePool contract, ensuring data accuracy by using on-chain data."
};
