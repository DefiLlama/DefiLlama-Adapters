import Web3 from 'web3';
import snx from '@oikos/oikos-bsc';
import axios from 'axios';
import feePoolABI from './FeePoolABI.json' assert { type: 'json' };
import exchangerABI from './ExchangerABI.json' assert { type: 'json' };
import exchangeRatesABI from './ExchangeRatesABI.json' assert { type: 'json' };

const web3 = new Web3('https://bsc-dataseed.binance.org/');

// Contract Addresses
const feePoolAddress = '0x4a7644B4b3ae6E4e2c53D01a39E7C4afA25061aF';
const exchangerAddress = '0xad17064Ad709f37CB97af2e26E2F9E896a65EBa4';
const exchangeRatesAddress = '0xe1ff83762F2db7274b6AC2c1C9Bb75B2A8574EaF';

const feePool = new web3.eth.Contract(feePoolABI, feePoolAddress);
const exchanger = new web3.eth.Contract(exchangerABI, exchangerAddress);
const exchangeRates = new web3.eth.Contract(exchangeRatesABI, exchangeRatesAddress);

const toBytes32 = text => web3.utils.asciiToHex(text.padEnd(32, '\0'));

async function fetch({ endTimestamp }) {
    console.log("Starting combined data retrieval for Oikos...");

    let totalValueLocked = 0;
    let totalFees = 0;

    try {
        // TVL Calculation
        const synths = snx.getSynths({ network: 'bsc' });
        for (const synth of synths) {
            const tokenName = synth.name.toLowerCase();
            try {
                const currencyKey = toBytes32(synth.name);
                const oraclePrice = await exchangeRates.methods.rateForCurrency(currencyKey).call();
                const oracleUSD = Number(oraclePrice) / 1e18;
                totalValueLocked += oracleUSD;
                console.log(`✅ Found Oracle price for: ${tokenName} - ${oracleUSD} USD`);
            } catch (oracleError) {
                console.warn(`⚠️ Failed to fetch Oracle price for: ${tokenName}`);
            }
        }

        // Revenue Calculation
        const feesByPeriod = await feePool.methods.feesByPeriod(feePoolAddress).call();
        totalFees = Number(feesByPeriod[0][0]) / 1e18;

        console.log(`✅ Total TVL Calculated: ${totalValueLocked} USD`);
        console.log(`✅ Total Revenue Calculated: ${totalFees} USD`);

        return {
            tvl: totalValueLocked.toFixed(2),
            dailyFees: totalFees.toFixed(2),
            dailyRevenue: totalFees.toFixed(2),
            dailySupplySideRevenue: totalFees.toFixed(2)
        };

    } catch (error) {
        console.error("❌ Error fetching data:", error.message);
        return { tvl: 0, dailyFees: 0, dailyRevenue: 0, dailySupplySideRevenue: 0 };
    }
}

export const handler = {
    fetch
};
