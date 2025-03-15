const Web3 = require('web3').Web3;
const axios = require('axios');
const feePoolABI = require('./FeePoolABI.json');
const exchangerABI = require('./ExchangerABI.json');

const web3 = new Web3('https://bsc-dataseed.binance.org/'); // BSC Mainnet RPC

// Key contract addresses
const feePoolAddress = '0x4a7644B4b3ae6E4e2c53D01a39E7C4afA25061aF';
const exchangerAddress = '0xad17064Ad709f37CB97af2e26E2F9E896a65EBa4';

const feePool = new web3.eth.Contract(feePoolABI, feePoolAddress);
const exchanger = new web3.eth.Contract(exchangerABI, exchangerAddress);

// Utility function to convert string to bytes32
const toBytes32 = text => web3.utils.asciiToHex(text.padEnd(32, '\0'));

async function fetchCombinedData() {
    console.log("Starting combined data retrieval for Oikos...");

    try {
        // Fetch total accumulated fees from FeePool (improved logic)
        let totalFees = 0;

        if (feePool.methods.totalFeesAvailable) {
            totalFees = await feePool.methods.totalFeesAvailable().call();
        } else if (feePool.methods.getFeesByPeriod) {
            const feesByPeriod = await feePool.methods.getFeesByPeriod(0).call();
            totalFees = Number(feesByPeriod[0]) / 1e18;
        } else if (feePool.methods.recordedFees) {
            totalFees = await feePool.methods.recordedFees().call();
        }

        totalFees = Number(totalFees) / 1e18;

        // Attempting to calculate Exchanger revenue (fallback)
        const exchangeFeeRate = await exchanger.methods.feeRateForExchange(toBytes32('oUSD'), toBytes32('oBTC')).call();
        const totalSwapFees = Number(exchangeFeeRate) / 1e18;

        const totalRevenue = totalFees + totalSwapFees;

        console.log(`✅ Total TVL Calculated: ${totalFees} USD`);
        console.log(`✅ Total Revenue Calculated: ${totalRevenue} USD`);

        return {
            tvl: totalFees.toFixed(2),
            dailyFees: totalRevenue.toFixed(2),
            dailyRevenue: totalRevenue.toFixed(2),
            dailySupplySideRevenue: totalRevenue.toFixed(2),
        };

    } catch (error) {
        console.error("❌ Error fetching revenue data:", error.message);
        return { tvl: 0, dailyFees: 0, dailyRevenue: 0, dailySupplySideRevenue: 0 };
    }
}

module.exports = {
    handler: {
        fetch: fetchCombinedData
    },
    methodology: {
        Fees: "Fees are derived from the FeePool contract. Swap fees from the Exchanger contract serve as fallback data.",
        Revenue: "Protocol revenue is calculated from the combination of FeePool data and Exchanger fees."
    }
};
