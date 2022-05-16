const sdk = require('@defillama/sdk');
const { config, whitelist, protocolPairs, tokens,
  getNumLockedTokens, getLockedTokenAtIndex, 
  lockedTokensLength, lockedToken, stakingContracts } = require('./config')
const BigNumber = require("bignumber.js");

const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const { getBlock } = require('../helper/getBlock');
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

async function getLockerTVL(chain, contract, block) {

  let balances = {};     

  let isV1 = (contract == config.pol.contract)

  const getLocks = Number(
    (
      await sdk.api.abi.call({
        abi: isV1 ? lockedTokensLength : getNumLockedTokens,
        target: contract,
        chain: chain,
        block: block,
      })
    ).output
  );

  const lockIds = Array.from(Array(getLocks).keys());

  const lockedLPs = (
    await sdk.api.abi.multiCall({
      abi: isV1 ? lockedToken : getLockedTokenAtIndex,
      calls: lockIds.map((lockid) => ({
        target: contract,
        params: lockid,
      })),
      chain: chain,
      block: block,
    })
  )
  .output.map((lp) => (lp.output.toLowerCase()));

  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lockedLPs.map((lp) => ({
        target: lp,
        params: contract,
      })),
      abi: "erc20:balanceOf",
      block: block,
      chain: chain,
    })
    ).output;
  

  let filteredLps = lpBalances
  .filter(lp => lp.output > 0)
  .map((lp) => {
    return {
      balance: BigNumber(lp.output).times(BigNumber(2)).toFixed(0),
      token: lp.input.target,
    }
  });

  await unwrapUniswapLPs(balances, filteredLps, block, chain, (addr) => `${chain}:${addr}`);
  
  balances = Object.keys(balances)
  .filter(balance => whitelist.includes(balance))
  .reduce((obj, balance) => {
    obj[balance] = balances[balance];
    return obj;
  }, {});

  return balances;
}

function tvl(args){
  return async (timestamp, ethBlock, chainBlocks) => {
    let totalBalances = {}
    for (let i = 0; i < args.length; i++) {
      let block = await getBlock(timestamp, args[i].chain, chainBlocks)
      let balances = await getLockerTVL(args[i].chain, args[i].contract, block);
      for (const [token, balance] of Object.entries(balances)) {
        if (!totalBalances[token]) totalBalances[token] = '0'
          totalBalances[token] = BigNumber(totalBalances[token]).plus(BigNumber(balance)).toFixed(0) 
        }
    }
    return totalBalances
  }
}

module.exports = {
  timetravel: true,
  methodology: 
  `Counts each LP pair's native token and 
   stable balance, adjusted to reflect locked pair's value. 
   Balances and merged across multiple 
   locker and staking contracts to return sum TVL per chain`,

  ethereum: {
  staking: stakings(
    stakingContracts, 
    tokens.uncx_eth, 
    config.uniswapv2.chain
    ),
  tvl: tvl([
    {
      contract: config.uniswapv2.locker, 
      chain: config.uniswapv2.chain
    },
    {
      contract: config.sushiswap.locker, 
      chain: config.sushiswap.chain
    }
  ]),

  pool2: pool2s([config.uniswapv2.locker, config.pol.locker], 
    [protocolPairs.uncx_WETH, protocolPairs.uncl_WETH, protocolPairs.unc_WETH], 
     config.uniswapv2.chain)
  },
  bsc: {
  tvl: tvl([
    {
      contract: config.pancakeswapv2.locker, 
      chain: config.pancakeswapv2.chain
    },
    {
      contract: config.pancakeswapv1.locker, 
      chain: config.pancakeswapv1.chain
    },
    {
      contract: config.safeswap.locker, 
      chain: config.safeswap.chain
    },
    {
      contract: config.julswap.locker,
      chain: config.julswap.chain
    }
  ]),

  pool2: pool2s([config.pancakeswapv2.locker, config.pancakeswapv1.locker], 
      [protocolPairs.uncx_BNB], config.pancakeswapv2.chain)
  },
  polygon: {
    tvl: tvl([
      {
        contract: config.quickswap.locker, 
        chain: config.quickswap.chain
      },
    ])
  }
}
