const sdk = require('@defillama/sdk');
const { default: axios } = require('axios');
const { getBlock } = require('./helper/getBlock');
const { getChainTransform } = require('./helper/portedTokens');
const { sumTokens2 } = require('./helper/unwrapLPs');

// ABIs
const ExchangeRatesABI = require('./abis/ExchangeRates.json');
const FeePoolABI = require('./abis/FeePool.json');
const ExchangerABI = require('./abis/Exchanger.json');
const SynthABI = require('./abis/Synth.json');

// Constants
const CHAIN = 'bsc';
const EXCHANGE_RATES_ADDRESS = '0xExchangeRatesAddress'; // Replace with actual address
const FEE_POOL_ADDRESS = '0xFeePoolAddress'; // Replace with actual address
const EXCHANGER_ADDRESS = '0xExchangerAddress'; // Replace with actual address

// Helper function to fetch Oracle prices
async function fetchOraclePrices(block) {
  const rates = await sdk.api.abi.call({
    target: EXCHANGE_RATES_ADDRESS,
    abi: ExchangeRatesABI.find(({ name }) => name === 'ratesForCurrencies'),
    params: [['sUSD', 'sBTC', 'sETH']], // Replace with actual synth symbols
    chain: CHAIN,
    block,
  });

  return rates.output.reduce((acc, rate, index) => {
    acc[['sUSD', 'sBTC', 'sETH'][index]] = rate; // Replace with actual synth symbols
    return acc;
  }, {});
}

// TVL Calculation
async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, CHAIN, chainBlocks);
  const transform = await getChainTransform(CHAIN);

  // Fetch Oracle prices
  const oraclePrices = await fetchOraclePrices(block);

  // Fetch synth balances
  const synthBalances = await sdk.api.abi.multiCall({
    calls: ['sUSD', 'sBTC', 'sETH'].map((symbol) => ({ // Replace with actual synth symbols
      target: symbol, // Replace with actual synth addresses
      params: [],
    })),
    abi: SynthABI.find(({ name }) => name === 'totalSupply'),
    chain: CHAIN,
    block,
  });

  // Calculate TVL
  const tvl = synthBalances.output.reduce((acc, { input: { target }, output }) => {
    const price = oraclePrices[target];
    if (price) {
      acc += output * price / 1e18; // Adjust decimals if necessary
    }
    return acc;
  }, 0);

  return {
    tether: tvl, // Report TVL in USD
  };
}

// Revenue Calculation
async function revenue(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, CHAIN, chainBlocks);

  // Fetch fees from FeePool
  const feePoolFees = await sdk.api.abi.call({
    target: FEE_POOL_ADDRESS,
    abi: FeePoolABI.find(({ name }) => name === 'totalFeesAvailable'),
    chain: CHAIN,
    block,
  });

  // Fetch swap fees from Exchanger
  const exchangerFees = await sdk.api.abi.call({
    target: EXCHANGER_ADDRESS,
    abi: ExchangerABI.find(({ name }) => name === 'feeRateForExchange'),
    chain: CHAIN,
    block,
  });

  // Calculate total revenue
  const totalRevenue = feePoolFees.output + exchangerFees.output;

  return {
    tether: totalRevenue / 1e18, // Adjust decimals if necessary
  };
}

// Export the adapter
module.exports = {
  timetravel: true, // Indicates if the adapter supports time travel (historical data)
  methodology: "TVL is calculated by fetching Oracle prices from the ExchangeRates contract. Revenue is derived from the FeePool and Exchanger contracts.",
  start: 1638316800, // Timestamp when the protocol launched
  bsc: {
    tvl, // TVL calculation
    revenue, // Revenue calculation
  },
};
