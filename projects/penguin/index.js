const sdk = require('@defillama/sdk');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking');
const { addFundsInMasterChef } = require('../helper/masterchef');
const abi = require('./abi.json')
const abiGeneral = require('../helper/abis/masterchef.json');
const { default: BigNumber } = require('bignumber.js');

const masterchefIgloos = "0x8AC8ED5839ba269Be2619FfeB3507baB6275C257"
const pool2Token = '0x494Dd9f783dAF777D3fb4303da4de795953592d0'
const iglooTokens = ['0x1bb5541EcCdA68A352649954D4C8eCe6aD68338d', '0x0b9753D73e1c62933e913e9c2C94f2fFa8236F6C', '0x1aCf1583bEBdCA21C8025E172D8E8f2817343d65']
const nest = '0xD79A36056c271B988C5F1953e664E61416A9820F'
const pefiToken = '0xe896CDeaAC9615145c0cA09C8Cd5C25bced6384c'
const nestv2 = '0xE9476e16FE488B90ada9Ab5C7c2ADa81014Ba9Ee'

const masterChef = "0x256040dc7b3CECF73a759634fc68aA60EA0D68CB"

const ACC_PEFI_PRECISION = 1e18;

async function getTokensInMasterChef(time, ethBlock, chainBlocks) {
  const chain = "avax"
  const block = chainBlocks[chain]
  const transformAddress = addr => `avax:${addr}`
  const ignoreAddresses = [pefiToken]

  const balances = {}
  const poolLength = (
    await sdk.api.abi.call({
      abi: abiGeneral.poolLength,
      target: masterChef,
      block,
      chain,
    })
  ).output;

  const poolInfo = (
    await sdk.api.abi.multiCall({
      block,
      calls: Array.from(Array(Number(poolLength)).keys()).map(i => ({
        target: masterChef,
        params: i,
      })),
      abi: abi.poolInfo,
      chain,
    })
  ).output;

  const [symbols] = await Promise.all([
    sdk.api.abi.multiCall({
      block,
      calls: poolInfo.map(p => ({
        target: p.output[0]
      })),
      abi: 'erc20:symbol',
      chain,
    })
  ])

  const lpPositions = [];

  symbols.output.forEach((symbol, idx) => {
    const pool = poolInfo[idx].output
    const balance = BigNumber(pool.totalShares).times(pool.lpPerShare).div(ACC_PEFI_PRECISION).toFixed(0);
    const token = symbol.input.target;
    if (ignoreAddresses.some(addr => addr.toLowerCase() === token.toLowerCase())) {
      return
    }
    if (symbol.output.includes('LP') || symbol.output.includes('PGL')) {
      lpPositions.push({
        balance,
        token
      });
    } else {
      sdk.util.sumSingleBalance(balances, transformAddress(token), balance)
    }
  })

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    transformAddress
  );
  return balances
}

module.exports = {
  staking: {
    tvl: sdk.util.sumChainTvls([nest, nestv2].map(chef => staking(chef, pefiToken, "avax"))),
  },
  tvl: getTokensInMasterChef,
}
