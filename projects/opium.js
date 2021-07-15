const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const _ = require('underscore');

const utils = require('./helper/utils');
const { unwrapUniswapLPs } = require('./helper/unwrapLPs');

const CHAINS = {
  ETHEREUM: 'ethereum',
  POLYGON: 'polygon',
  BSC: 'bsc'
}

const SUB_TOKENS = {
  'polygon:0x1d2a0E5EC8E5bBDCA5CB219e649B565d8e5c3360': 'polygon:0xd6df932a45c0f255f85145f286ea0b292b21c90b' // amAAVE -> AAVE
}

const LP_TOKENS = [
  '0xd84d55532b231dbb305908bc5a10b8c55ba21e5e' // SushiSwap LP OPIUM<>WETH
]

const tvl = (url, chain) => async (timestamp, blockETH, chainBlocks) => {
  const balances = {};
  const lpPositions = [];

  var opium = await utils.fetchURL(url);

  let { tokens, contracts } = opium.data;

  // Prepare multiCall structure
  const calls = []
    _.each(tokens, (token) => {
      _.each(contracts, (contract) => {
        calls.push({
          target: token,
          params: contract
        })
      })
    })

  const balanceOfResults = await sdk.api.abi.multiCall({
    chain,
    block: chain === CHAINS.ETHEREUM ? blockETH : chainBlocks[chain],
    calls,
    abi: 'erc20:balanceOf'
  });

  // Sum all balances
  _.each(balanceOfResults.output, (balanceOf) => {
    if(balanceOf.success) {
      const address = balanceOf.input.target;
      const balance = balances[address] ? BigNumber(balanceOf.output).plus(BigNumber(balances[address])).toFixed().toString(): balanceOf.output;

      balances[address] = balance;
    }
  });

  // Iterate over final balances
  // - Add chain prefixes
  // - Substitute unrecognized tokens
  // - Extract LP tokens
  for (let token in balances) {
    // Add chain prefix if non ETHEREUM
    if (chain !== CHAINS.ETHEREUM) {
      balances[`${chain}:${token}`] = balances[token]
      delete balances[token]
      token = `${chain}:${token}`
    }

    // Substitute unrecognized tokens
    const subToken = SUB_TOKENS[token]
    if (subToken) {
      balances[subToken] = balances[token]
      delete balances[token]
    }

    // Extract LP tokens into separate array to unwrap later
    if (LP_TOKENS.includes(token)) {
      lpPositions.push({
        token,
        balance: balances[token]
      })
      delete balances[token]
    }
  }

  // Unwrap LP tokens
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chain === CHAINS.ETHEREUM ? blockETH : chainBlocks[chain],
    chain
  )

  return balances;
}

const ethTvl = tvl('https://static.opium.network/data/opium-addresses.json', CHAINS.ETHEREUM)
const polygonTvl = tvl('https://static.opium.network/data/opium-addresses-polygon.json', CHAINS.POLYGON)
const bscTvl = tvl('https://static.opium.network/data/opium-addresses-bsc.json', CHAINS.BSC)

module.exports = {
  [CHAINS.ETHEREUM]: {
    tvl: ethTvl
  },
  [CHAINS.POLYGON]: {
    tvl: polygonTvl
  },
  [CHAINS.BSC]: {
    tvl: bscTvl
  },
  tvl: sdk.util.sumChainTvls([
    ethTvl,
    polygonTvl,
    bscTvl
  ])
};
