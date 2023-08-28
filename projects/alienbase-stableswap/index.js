const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");


const stableSwapPools = {
  'aUsdc-Dai': {
    name: 'USDC-DAI Stable',
    address: '0x927860797d07b1C46fbBe7f6f73D45C7E1BFBb27',
    assets: ['USDC', 'DAI'],
    lpToken: 'aUSDC-DAI'
  },
}

const stableSwapTokens = {
  USDC: {
    address: ADDRESSES.base.USDbC,
    decimals: 6,
    symbol: 'USDC',
    gecko: 'usd-coin'
  },
  DAI: {
    address: ADDRESSES.base.DAI,
    decimals: 18,
    symbol: 'DAI',
    gecko: 'dai'
  },
}


async function stableDexTVL(timestamp, _block, chainBlocks) {
  const block = chainBlocks.base
  let balances = {};
  let calls = [];

  for (const pool of Object.values(stableSwapPools)) {
    for (const token of pool.assets)
      if (stableSwapTokens[token]) {
        calls.push({
          target: stableSwapTokens[token].address,
          params: pool.address,
        });
      }
  }

  // Pool Balances
  let balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: calls,
    abi: "erc20:balanceOf",
    chain: 'base'
  });

  // Compute Balances
  balanceOfResults.output.forEach((balanceOf) => {
    let address = balanceOf.input.target;
    let amount = balanceOf.output;
    amount = BigNumber(amount).toFixed();
    balances[address] = BigNumber(balances[address] || 0)
      .plus(amount)
      .toFixed();
  });


  const finalBalances = {}
  for (const tokenAddress in balances) {
    const asset = Object.values(stableSwapTokens).find(r => r.address.toLowerCase() == tokenAddress.toLowerCase());
    sdk.util.sumSingleBalance(finalBalances, asset.gecko, (balances[tokenAddress]) / (10 ** asset.decimals))
  }

  return finalBalances;
}


module.exports = {
  methodology: `Queries balances of StableSwap pools and sums their total value`,
  base: {
    tvl: stableDexTVL,
  }
};