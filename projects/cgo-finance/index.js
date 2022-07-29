const sdk = require('@defillama/sdk');
const chefAbi = require('./vaultChefAbi.json')
const tokenAbi = require("../helper/abis/token.json");
const token0Abi = require("../helper/abis/token0.json");
const token1Abi = require("../helper/abis/token1.json");
const getReservesAbi = require("../helper/abis/getReserves.json");
const strategyAbi =  require('./strategyAbi.json')

const { unwrapUniswapLPs, unwrapLPsAuto, isLP } = require('../helper/unwrapLPs')
const { getBlock } = require('../helper/getBlock');
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform, getFixBalances } = require('../helper/portedTokens');

// --- Cronos Addresses ---
const VaultChefContractCronos = "0x5795BE23A2C330209849e0D1D19cc05755E23Ca2";
const CGO_Cronos = "0x869c3e35Ef9E5F50003D9a2A80f1D61d670D4CB6";

async function getSymbolsAndBalances(block, chain, poolInfo, wantLockedTotal = strategyAbi.wantLockedTotal) {
  const [symbols, tokenBalances] = await Promise.all([
      sdk.api.abi.multiCall({
          block,
          calls: poolInfo.map(p => ({
              target: p.output[0]
          })),
          abi: 'erc20:symbol',
          chain,
      }),
      sdk.api.abi.multiCall({
          block,
          calls: poolInfo.map(p => ({
              target: p.output[4]              
          })),
          abi: wantLockedTotal,
          chain,
      })
  ])
  return [symbols, tokenBalances]
}

async function getPoolInfo(
  vaultChef, 
  block,
  chain, 
  poolInfoAbi = chefAbi.poolInfo
){
  const poolLength = (
    await sdk.api.abi.call({
        abi: chefAbi.poolLength,
        target: vaultChef,
        block,
        chain,
    })
  ).output;

  const poolInfo = (
    await sdk.api.abi.multiCall({
        block,
        calls: Array.from(Array(Number(poolLength)).keys()).map(i => ({
            target: vaultChef,
            params: i,
        })),
        abi: poolInfoAbi,
        chain,
    })
  ).output;

  return poolInfo
}

function vaultMasterChefExports(masterChef, 
  chain, 
  stakingTokenRaw, 
  poolInfoAbi = chefAbi.poolInfo, 
  wantLockedTotalAbi = strategyAbi.wantLockedTotal,
  tokenIsOnCoingecko = true) {

  const stakingToken = stakingTokenRaw.toLowerCase();
  let balanceResolve;

  async function getTvl(timestamp, ethBlock, chainBlocks) {
    const block = await getBlock(timestamp, chain, chainBlocks, true)
    const transformAddress = await getChainTransform(chain);

    const poolInfo = await getPoolInfo(masterChef, block, chain, poolInfoAbi)
    const [symbols, tokenBalances] = await getSymbolsAndBalances(block, chain, poolInfo, wantLockedTotalAbi);

    const balances = {
      staking: {},
      pool2: {},
      tvl: {}
    } 

    const lpPositions = [];

    await Promise.all(symbols.output.map(async (symbol, idx) => {
      const balance = tokenBalances.output[idx].output;
      const token = symbol.input.target.toLowerCase();
      if (token === stakingToken) {
          sdk.util.sumSingleBalance(balances.staking, transformAddress(token), balance)
      } else if (isLP(symbol.output, symbol.input.target, chain)) {
          lpPositions.push({
              balance,
              token
          });
      } else {
          sdk.util.sumSingleBalance(balances.tvl, transformAddress(token), balance)
      }
    }));

    const [token0, token1] = await Promise.all([
      sdk.api.abi.multiCall({
          calls: lpPositions.map(p => ({
              target: p.token
          })),
          abi: token0Abi,
          block,
          chain
      }),
      sdk.api.abi.multiCall({
          calls: lpPositions.map(p => ({
              target: p.token
          })),
          abi: token1Abi,
          block,
          chain
      }),
    ]);

    const pool2LpPositions = []
    const outsideLpPositions = []
    lpPositions.forEach((position, idx) => {
        if (token0.output[idx].output.toLowerCase() === stakingToken || token1.output[idx].output.toLowerCase() === stakingToken) {
            pool2LpPositions.push(position);
        } else {
            outsideLpPositions.push(position);
        }
    })
    await Promise.all([unwrapUniswapLPs(
        balances.tvl,
        outsideLpPositions,
        block,
        chain,
        transformAddress
    ), unwrapUniswapLPs(
        balances.pool2,
        pool2LpPositions,
        block,
        chain,
        transformAddress
    )]);

    if (!tokenIsOnCoingecko && pool2LpPositions.length) {
      const response = (await sdk.api.abi.multiCall({
          calls: pool2LpPositions.map(p => ({
              target: stakingToken,
              params: [p.token]
          })),
          abi: "erc20:balanceOf",
          block,
          chain
      })).output
      const maxPool2ByToken = response.reduce((max, curr) => {
          if (BigNumber(curr.output).gt(max.output)) {
              return curr
          }
          return max
      });
      const poolAddress = maxPool2ByToken.input.params[0].toLowerCase()
      const poolReserves = await sdk.api.abi.call({
          block,
          chain,
          abi: getReservesAbi,
          target: poolAddress
      })
      const posToken0 = token0.output.find(t => t.input.target.toLowerCase() === poolAddress).output;
      const posToken1 = token1.output.find(t => t.input.target.toLowerCase() === poolAddress).output;
      let price, otherToken;
      if (posToken0.toLowerCase() === stakingToken) {
          price = poolReserves.output[1] / poolReserves.output[0]
          otherToken = transformAddress(posToken1)
      } else {
          price = poolReserves.output[0] / poolReserves.output[1]
          otherToken = transformAddress(posToken0)
      }
      const transformedStakingToken = transformAddress(stakingToken)
      Object.values(balances).forEach(balance => {
          Object.entries(balance).forEach(([addr, bal]) => {
              if (addr.toLowerCase() === transformedStakingToken) {
                  balance[otherToken] = BigNumber(bal).times(price).toFixed(0)
                  delete balance[addr]
              }
          })
      })
    }

    if (['cronos'].includes(chain)) {
      const fixBalances = await getFixBalances(chain)
      Object.values(balances).map(fixBalances)
    }

    return balances
  };

  function getTvlPromise(key) {
    return async (ts, _block, chainBlocks) => {
        if (!balanceResolve)
            balanceResolve = getTvl(ts, _block, chainBlocks)
        return (await balanceResolve)[key]
    }
  }

  return {
      methodology: "TVL includes all farms in MasterChef contract",
      [chain]: {
          staking: getTvlPromise("staking"),
          pool2: getTvlPromise("pool2"),
          masterchef: getTvlPromise("tvl"),
          tvl: getTvlPromise("tvl"),
      }
  };
}


module.exports = {
  misrepresentedTokens: true,
  ...vaultMasterChefExports(VaultChefContractCronos, "cronos", CGO_Cronos, 
  chefAbi.poolInfo, 
  strategyAbi.wantLockedTotal,
  false),
  methodology:
    "TVL includes all farms in MasterChef contract",
};