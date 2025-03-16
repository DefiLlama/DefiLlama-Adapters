const { ethers } = require('ethers');
const axios = require('axios');
const feePoolABI = require('./FeePoolABI.json');
const exchangerABI = require('./ExchangerABI.json');

const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/'); // BSC Mainnet RPC

const FEEPOOL_ADDRESS = "0x4a7644B4b3ae6E4e2c53D01a39E7C4afA25061aF";
const EXCHANGER_ADDRESS = "0xad17064Ad709f37CB97af2e26E2F9E896a65EBa4";

const feePoolContract = new ethers.Contract(FEEPOOL_ADDRESS, feePoolABI, provider);
const exchangerContract = new ethers.Contract(EXCHANGER_ADDRESS, exchangerABI, provider);

async function fetch({ endTimestamp }) {
    console.log("Starting combined data retrieval for Oikos...");

    const totalRevenue = await feePoolContract.totalFees(); 
    const tvl = await exchangerContract.getTotalIssuedSynths(); 

    return {
        tvl: (parseFloat(tvl) / 1e18).toFixed(2),
        dailyFees: (parseFloat(totalRevenue) / 1e18).toFixed(2),
        dailyRevenue: (parseFloat(totalRevenue) / 1e18).toFixed(2),
        dailySupplySideRevenue: (parseFloat(totalRevenue) / 1e18).toFixed(2)
    };
}

module.exports = {
    adapter: {
        fetch,
        meta: {
            methodology: {
                TVL: "Derived from total issued synths in the Exchanger contract.",
                Fees: "Fees collected directly from the FeePool contract.",
                Revenue: "Protocol revenue is equal to total fees collected.",
                SupplySideRevenue: "LP revenue is included in total fees."
            }
        }
    }
};
