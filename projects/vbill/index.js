const abi = require('./abi.json');
const { getTokenSupplies } = require('../helper/solana');
const { getResource } = require('../helper/chain/aptos');

// VBILL token addresses for different chains
const VBILL_ADDRESSES = {
  ethereum: {
    token: '0x2255718832bC9fD3bE1CaF75084F4803DA14FF01',
    priceFeed: '0xA569E68B5D110F2A255482c2997DFDBe1b2ab912'
  },
  avax: {
    token: '0x7F4546eF315Efc65336187Fe3765ea779Ac90183',
    priceFeed: null // Add price feed address when available
  },
  bsc: {
    token: '0x14d72634328C4D03bBA184A48081Df65F1911279',
    priceFeed: '0x84AD474c33c9cCefB1a2D8b77Bdd88bDc592f96b'
  },
  solana: {
    token: '34mJztT9am2jybSukvjNqRjgJBZqHJsHnivArx1P4xy1',
    priceFeed: null // Add price feed address when available
  }
};

// Always fetch price from Ethereum, regardless of current chain
async function getEthPriceFeed() {
  try {
    const priceData = await global.api.call({
      abi: abi.latestRoundData,
      target: VBILL_ADDRESSES.ethereum.priceFeed,
      chain: 'ethereum',
    });
    const priceDecimals = await global.api.call({
      abi: abi.priceDecimals,
      target: VBILL_ADDRESSES.ethereum.priceFeed,
      chain: 'ethereum',
    });
    const description = await global.api.call({
      abi: abi.description,
      target: VBILL_ADDRESSES.ethereum.priceFeed,
      chain: 'ethereum',
    });
    console.log(`VBILL Price Feed Description: ${description}`);
    console.log(`VBILL Latest Price: ${priceData.answer} (decimals: ${priceDecimals})`);
    return { price: priceData.answer, priceDecimals };
  } catch (error) {
    console.error('Error getting price data from Ethereum:', error.message);
    return { price: null, priceDecimals: null };
  }
}

async function tvl(api) {
  const { chain } = api;
  const chainAddresses = VBILL_ADDRESSES[chain];
  global.api = api; // for getEthPriceFeed

  if (!chainAddresses) {
    console.warn(`No VBILL addresses configured for chain: ${chain}`);
    return api.getBalances();
  }

  // Always get price from Ethereum
  const { price, priceDecimals } = await getEthPriceFeed();

  // Handle Solana differently using getTokenSupplies
  if (chain === 'solana') {
    await getTokenSupplies([chainAddresses.token], { api });
    return api.getBalances();
  }

  // Get the total supply of VBILL tokens for EVM chains
  let totalSupply;
  try {
    totalSupply = await api.call({
      abi: abi.totalSupply,
      target: chainAddresses.token,
    });
    console.log(`VBILL Total Supply on ${chain}: ${totalSupply}`);
    api.add(chainAddresses.token, totalSupply);
  } catch (error) {
    console.error(`Error fetching total supply for ${chain}:`, error.message);
  }

  return api.getBalances();
}

module.exports = {
  methodology: 'TVL is calculated as the total supply of VBILL tokens across all supported chains. For calculation simplicity, price data is retrieved from the Ethereum price feed contract and applied to all chains. VBILL is a multi-chain RWA token with a shared price/token across chains.',
  ethereum: { tvl },
  avax: { tvl },
  bsc: { tvl },
  solana: { tvl }
};