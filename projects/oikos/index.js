import Web3 from 'web3';
import snx from '@oikos/oikos-bsc';
import axios from 'axios';
import exchangeRatesABI from './ExchangeRatesABI.json' assert { type: 'json' };

const web3 = new Web3('https://bsc-dataseed.binance.org/'); // BSC Mainnet RPC
const exchangeRatesAddress = '0xe1ff83762F2db7274b6AC2c1C9Bb75B2A8574EaF';

const exchangeRates = new web3.eth.Contract(exchangeRatesABI, exchangeRatesAddress);

async function fetch() {
    console.log("Starting data retrieval for Oikos...");

    try {
        const synths = snx.getSynths({ network: 'bsc' });

        let totalValueLocked = 0;
        const tokenList = synths.map(synth => synth.name.toLowerCase()).join(',');

        // Iterate through Synths
        for (const synth of synths) {
            const tokenName = synth.name.toLowerCase();

            // Attempt to fetch Oracle price from the Oikos contract first
            try {
                const currencyKey = web3.utils.rightPad(
                    web3.utils.asciiToHex(synth.name),
                    64
                );

                const oraclePrice = await exchangeRates.methods
                    .rateForCurrency(currencyKey)
                    .call();

                const oracleUSD = Number(oraclePrice) / 1e18;
                totalValueLocked += oracleUSD;

                console.log(`✅ Found Oracle price for: ${tokenName} - ${oracleUSD} USD`);
                continue;
            } catch (oracleError) {
                console.warn(`⚠️ Failed to fetch Oracle price for: ${tokenName}`);
            }

            // If Oracle data fails, try CoinGecko as fallback
            try {
                const response = await axios.get(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenName}&vs_currencies=usd`
                );

                if (response.data[tokenName]) {
                    totalValueLocked += response.data[tokenName].usd;
                    console.log(`✅ Fallback to CoinGecko price for: ${tokenName} - ${response.data[tokenName].usd} USD`);
                } else {
                    console.warn(`⚠️ Missing data for: ${tokenName} (Both Oracle and CoinGecko failed)`);
                }
            } catch (geckoError) {
                console.warn(`⚠️ Failed to fetch fallback CoinGecko price for: ${tokenName}`);
            }
        }

        console.log(`✅ Total TVL Calculated: ${totalValueLocked}`);
        return { tvl: totalValueLocked };

    } catch (error) {
        console.error("❌ Error fetching data:", error.message);
        return { tvl: 0 };
    }
}

export default {
    methodology: "TVL based on the total value of circulating Synths on BSC, prioritizing on-chain Oracle prices with CoinGecko as fallback.",
    fetch
};

fetch().then(console.log);
