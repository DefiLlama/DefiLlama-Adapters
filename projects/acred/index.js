const abi = require('./abi.json');
const { getTokenSupplies } = require('../helper/solana');
const { getResource } = require('../helper/chain/aptos');

// ACRED token addresses for different chains
const ACRED_ADDRESSES = {
  ethereum: {
    token: '0x17418038ecF73BA4026c4f428547BF099706F27B',
    priceFeed: '0xD6BcbbC87bFb6c8964dDc73DC3EaE6d08865d51C'
  },
  avax: {
    token: '0x7C64925002BFA705834B118a923E9911BeE32875',
    priceFeed: null // Add price feed address when available
  },
  polygon: {
    token: '0xFCe60bBc52a5705CeC5B445501FBAf3274Dc43D0',
    priceFeed: null // Add price feed address when available
  },
  aptos: {
    token: '0xe528f4df568eb9fff6398adc514bc9585fab397f478972bcbebf1e75dee40a88',
    priceFeed: null // Add price feed address when available
  },
  ink: {
    token: '0x53Ad50D3B6FCaCB8965d3A49cB722917C7DAE1F3',
    priceFeed: null // Add price feed address when available
  },
  solana: {
    token: 'FubtUcvhSCr3VPXEcxouoQjKQ7NWTCzXyECe76B7L3f8',
    priceFeed: null // Add price feed address when available
  },
  sei: {
    token: '0xf7fa6725183e603059fc23d95735bf67f72b2d78',
    priceFeed: null // Add price feed address when available
  }
};

// Always fetch price from Ethereum, regardless of current chain
async function getEthPriceFeed() {
  try {
    const priceData = await global.api.call({
      abi: abi.latestRoundData,
      target: ACRED_ADDRESSES.ethereum.priceFeed,
      chain: 'ethereum',
    });
    const priceDecimals = await global.api.call({
      abi: abi.priceDecimals,
      target: ACRED_ADDRESSES.ethereum.priceFeed,
      chain: 'ethereum',
    });
    const description = await global.api.call({
      abi: abi.description,
      target: ACRED_ADDRESSES.ethereum.priceFeed,
      chain: 'ethereum',
    });
    console.log(`ACRED Price Feed Description: ${description}`);
    console.log(`ACRED Latest Price: ${priceData.answer} (decimals: ${priceDecimals})`);
    return { price: priceData.answer, priceDecimals };
  } catch (error) {
    console.log('Error getting price data from Ethereum:', error.message);
    return { price: null, priceDecimals: null };
  }
}

async function tvl(api) {
  const { chain } = api;
  const chainAddresses = ACRED_ADDRESSES[chain];
  global.api = api; // for getEthPriceFeed

  if (!chainAddresses) {
    console.log(`No ACRED addresses configured for chain: ${chain}`);
    return api.getBalances();
  }

  // Always get price from Ethereum
  const { price, priceDecimals } = await getEthPriceFeed();

  // Handle Solana differently using getTokenSupplies
  if (chain === 'solana') {
    await getTokenSupplies([chainAddresses.token], { api });
    return api.getBalances();
  }

  // Handle Aptos using getResource for fungible asset supply
  if (chain === 'aptos') {
    try {
      const resource = await getResource(chainAddresses.token, '0x1::fungible_asset::ConcurrentSupply', 'aptos');
      const totalSupply = resource.current.value;
      api.add(chainAddresses.token, totalSupply);
    } catch (e) {
      console.log(`Aptos: Could not fetch resource for ${chainAddresses.token}:`, e.message);
      // Optionally: api.add(chainAddresses.token, 0);
    }
    return api.getBalances();
  }

  // Get the total supply of ACRED tokens for EVM chains
  const totalSupply = await api.call({
    abi: abi.totalSupply,
    target: chainAddresses.token,
  });

  console.log(`ACRED Total Supply on ${chain}: ${totalSupply}`);

  // Add the total supply to the balances
  api.add(chainAddresses.token, totalSupply);

  return api.getBalances();
}

module.exports = {
  methodology: 'TVL is calculated as the total supply of ACRED tokens across all supported chains. Price data is retrieved from the Ethereum price feed contract and applied to all chains. ACRED is a multi-chain RWA token with a shared price/token across chains.',
  ethereum: { tvl },
  avax: { tvl },
  polygon: { tvl },
  aptos: { tvl },
  ink: { tvl },
  solana: { tvl },
  sei: { tvl }
};
