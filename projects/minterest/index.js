const abi = require('./Abi.json');
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const contractAddresses = {
  "ethereum": {
    "Supervisor": "0xD13f50274a68ABF2384C79248ADc259b3777c081",
  },
  "mantle": {
    "Supervisor": "0xe53a90EFd263363993A3B41Aa29f7DaBde1a932D",
  }
}

// Returns all supported market addresses
async function getAllMTokenAddresses(block, chain, networkContracts) {
  return (await sdk.api.abi.call({
    block,
    chain,
    target: networkContracts['Supervisor'],
    params: [],
    abi: abi['getAllMarkets'],
  })).output;
}

// Returns list of all market addresses and underlying tokens for each market
async function getMarkets(block, chain) {
    const networkSpecificAddresses = contractAddresses[chain];

    const markets = []

    const allMTokenAddresses = await getAllMTokenAddresses(block, chain, networkSpecificAddresses)
    const callData = allMTokenAddresses.map(i => ({ target: i }))
    const { output } = await sdk.api.abi.multiCall({
      chain,
      abi: abi['underlying'], calls: callData, block,
    })
    output.forEach(({ input: { target: mToken }, output: underlying}) => markets.push({ mToken, underlying, }))
    return markets;
}

// Retrieves locked tokens for each market and fulfill `balances` obj
async function getTvl({borrowed, chain, balances, block}) {
  let allMarkets = await getMarkets(block, chain);

  // Get tokens locked
  let totalLockedOutput = await sdk.api.abi.multiCall({
    chain,
    block,
    calls: allMarkets.map((market) => ({
      target: market.mToken,
    })),
    abi: borrowed ? abi['totalBorrows'] : abi['getCash'],
  });

  allMarkets.forEach((market) => {
    let getCash = totalLockedOutput.output.find((result) => result.input.target === market.mToken);
    balances[market.underlying] = BigNumber(balances[market.underlying] || 0)
      .plus(getCash.output)
      .toFixed();
  });

  return balances;
}

async function borrowed(_, _1, _2, {chain, ...args }) {
  const balances = {};
  await getTvl({ borrowed: true, balances, chain, ...args })
  return balances
}

async function tvl(_, _1, _2, {chain, ...args }) {
  let balances = {};
  await getTvl({ borrowed: false, chain, balances, ...args })
  return balances;
}

module.exports = {
  hallmarks: [
    [1677133355, "MINTY distribution begins on Ethereum"],
    [1704369540, "MINTY distribution begins on Mantle"],
  ],
  timetravel: true,
  ethereum: {
    tvl,
    borrowed
  },
  mantle: {
    tvl,
    borrowed
  },
  methodology: `TVL is calculated by getting the market addresses from Supervisor contract and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`,
};
  