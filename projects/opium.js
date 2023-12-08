const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const utils = require('./helper/utils');
const { unwrapUniswapLPs } = require('./helper/unwrapLPs');

const CHAINS = {
  ETHEREUM: 'ethereum',
  POLYGON: 'polygon',
  BSC: 'bsc',
  ARBITRUM: 'arbitrum'
}

const SUB_TOKENS = {
  'polygon:0x1d2a0e5ec8e5bbdca5cb219e649b565d8e5c3360': 'polygon:0xd6df932a45c0f255f85145f286ea0b292b21c90b', // amAAVE -> AAVE
  'ethereum:0xf1c9acdc66974dfb6decb12aa385b9cd01190e38': 'ethereum:0xfe2e637202056d30016725477c5da089ab0a043a' // osETH -> sETH2
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
    tokens.forEach((token) => {
      contracts.forEach((contract) => {
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
  balanceOfResults.output.forEach((balanceOf) => {
    const address = balanceOf.input.target.toLowerCase();
    const balance = balances[address]
      ? BigNumber(balanceOf.output).plus(BigNumber(balances[address])).toFixed().toString()
      : BigNumber(balanceOf.output).toFixed().toString();

    balances[address] = balance;
  });

  // Iterate over final balances
  // - Add chain prefixes
  // - Substitute unrecognized tokens
  // - Extract LP tokens
  for (let token in balances) {
    // Add chain prefix
    balances[`${chain}:${token}`] = balances[token]
    delete balances[token]
    token = `${chain}:${token}`

    // Substitute unrecognized tokens
    const subToken = SUB_TOKENS[token]
    if (subToken) {
      balances[subToken] = balances[subToken]
        ? BigNumber(balances[subToken]).plus(balances[token]).toFixed().toString()
        : BigNumber(balances[token]).toFixed().toString()
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
    chainBlocks[chain],
    chain
  )

  return balances;
}

const ethTvl = tvl('https://static.opium.network/data/opium-addresses.json', CHAINS.ETHEREUM)
const polygonTvl = tvl('https://static.opium.network/data/opium-addresses-polygon.json', CHAINS.POLYGON)
const bscTvl = tvl('https://static.opium.network/data/opium-addresses-bsc.json', CHAINS.BSC)
const arbitrumTvl = tvl('https://static.opium.network/data/opium-addresses-arbitrum.json', CHAINS.ARBITRUM)

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
  [CHAINS.ARBITRUM]: {
    tvl: arbitrumTvl
  },
};
