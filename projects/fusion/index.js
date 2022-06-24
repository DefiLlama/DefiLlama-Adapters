const sdk = require("@defillama/sdk");
const abi = require("../helper/abis/masterchef.json");
const { getBlock } = require("../helper/getBlock");
const { unwrapUniswapLPs, isLP } = require("../helper/unwrapLPs");
const { getChainTransform, getFixBalances } = require("../helper/portedTokens");
const tokenAbi = require("../helper/abis/token.json");
const token0Abi = require("../helper/abis/token0.json");
const token1Abi = require("../helper/abis/token1.json");
const getReservesAbi = require("../helper/abis/getReserves.json");
const BigNumber = require("bignumber.js");
const masterchef = "0x00501Ed66d67B1127809E54395F064e256b75B23";
const callStake = "0xe9749a786c77A89fd45dAd3A6Ad1022eEa897F97";
const bondStake = "0xaaBaB0FB0840DFfFc93dbeed364FB46b1ffD92EE";
const STAKEToken = "0x69D17C151EF62421ec338a0c92ca1c1202A427EC";

async function getPoolInfo(
  masterChef,
  block,
  chain,
  poolInfoAbi = abi.poolInfo
) {
  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: masterChef,
      block,
      chain,
    })
  ).output;

  const poolInfo = (
    await sdk.api.abi.multiCall({
      block,
      calls: Array.from(Array(Number(poolLength)).keys()).map((i) => ({
        target: masterChef,
        params: i,
      })),
      abi: poolInfoAbi,
      chain,
    })
  ).output;

  return poolInfo;
}

async function getSymbolsAndBalances(masterChef, block, chain, poolInfo) {
  const [symbols, tokenBalances] = await Promise.all([
    sdk.api.abi.multiCall({
      block,
      calls: poolInfo.map((p) => ({
        target: p.output[0],
      })),
      abi: "erc20:symbol",
      chain,
    }),
    sdk.api.abi.multiCall({
      block,
      calls: poolInfo.map((p) => ({
        target: p.output[0],
        params: masterChef,
      })),
      abi: "erc20:balanceOf",
      chain,
    }),
  ]);
  return [symbols, tokenBalances];
}

function masterChefExports(
  masterChef,
  chain,
  stakingTokenRaw,
  tokenIsOnCoingecko = true,
  poolInfoAbi = abi.poolInfo,
  includeYVTokens = false
) {
  const stakingToken = stakingTokenRaw.toLowerCase();
  let balanceResolve;
  const contracts = [callStake, bondStake];

  const tokens = [
    STAKEToken, // fantom SNT token
  ];
  async function stakeTvl(timestamp, block, chainBlocks) {
    const balances = {};

    let balanceOfCalls = [];
    contracts.forEach((contract) => {
      balanceOfCalls = [
        ...balanceOfCalls,
        ...tokens.map((token) => ({
          target: token,
          params: contract,
        })),
      ];
    });

    const balanceOfResult = (
      await sdk.api.abi.multiCall({
        block: chainBlocks.fantom,
        calls: balanceOfCalls,
        abi: "erc20:balanceOf",
        chain: "fantom",
      })
    ).output;

    /* combine token volumes on multiple contracts */
    balanceOfResult.forEach((result) => {
      let balance = new BigNumber(result.output || 0);
      if (balance <= 0) return;

      let asset = result.input.target;
      let total = balances[asset];

      if (total) {
        balances[asset] = balance.plus(total).toFixed();
      } else {
        balances[asset] = balance.toFixed();
      }
    });
    return balances;
  }
  async function getTvl(timestamp, ethBlock, chainBlocks) {
    const block = await getBlock(timestamp, chain, chainBlocks, true);
    const transformAddress = await getChainTransform(chain);

    const poolInfo = await getPoolInfo(masterChef, block, chain, poolInfoAbi);
    const [symbols, tokenBalances] = await getSymbolsAndBalances(
      masterChef,
      block,
      chain,
      poolInfo
    );

    const balances = {
      staking: {},
      pool2: {},
      tvl: {},
    };

    const lpPositions = [];

    await Promise.all(
      symbols.output.map(async (symbol, idx) => {
        const balance = tokenBalances.output[idx].output;
        const token = symbol.input.target.toLowerCase();
        if (isLP(symbol.output, symbol.input.target, chain)) {
          lpPositions.push({
            balance,
            token,
          });
        } else if (includeYVTokens && isYV(symbol.output)) {
          let underlyingToken = (
            await sdk.api.abi.call({
              target: token,
              abi: tokenAbi,
              block,
              chain,
            })
          ).output;
          sdk.util.sumSingleBalance(
            balances.tvl,
            transformAddress(underlyingToken),
            balance
          );
        } else {
          sdk.util.sumSingleBalance(
            balances.tvl,
            transformAddress(token),
            balance
          );
        }
      })
    );

    const stakeBalances = await stakeTvl(timestamp, ethBlock, chainBlocks);
    Object.keys(stakeBalances).forEach((key) => {
      sdk.util.sumSingleBalance(
        balances.staking,
        transformAddress(key),
        stakeBalances[key]
      );
      sdk.util.sumSingleBalance(
        balances.tvl,
        transformAddress(key),
        stakeBalances[key]
      );
    });

    const [token0, token1] = await Promise.all([
      sdk.api.abi.multiCall({
        calls: lpPositions.map((p) => ({
          target: p.token,
        })),
        abi: token0Abi,
        block,
        chain,
      }),
      sdk.api.abi.multiCall({
        calls: lpPositions.map((p) => ({
          target: p.token,
        })),
        abi: token1Abi,
        block,
        chain,
      }),
    ]);

    const pool2LpPositions = [];
    const outsideLpPositions = [];
    lpPositions.forEach((position, idx) => {
      if (
        token0.output[idx].output.toLowerCase() === stakingToken ||
        token1.output[idx].output.toLowerCase() === stakingToken
      ) {
        pool2LpPositions.push(position);
      } else {
        outsideLpPositions.push(position);
      }
    });

    await Promise.all([
      unwrapUniswapLPs(
        balances.tvl,
        outsideLpPositions,
        block,
        chain,
        transformAddress
      ),
      unwrapUniswapLPs(
        balances.pool2,
        pool2LpPositions,
        block,
        chain,
        transformAddress
      ),
    ]);

    console.log(balances);

    if (!tokenIsOnCoingecko && pool2LpPositions.length) {
      const response = (
        await sdk.api.abi.multiCall({
          calls: pool2LpPositions.map((p) => ({
            target: stakingToken,
            params: [p.token],
          })),
          abi: "erc20:balanceOf",
          block,
          chain,
        })
      ).output;
      const maxPool2ByToken = response.reduce((max, curr) => {
        if (BigNumber(curr.output).gt(max.output)) {
          return curr;
        }
        return max;
      });
      const poolAddress = maxPool2ByToken.input.params[0].toLowerCase();
      const poolReserves = await sdk.api.abi.call({
        block,
        chain,
        abi: getReservesAbi,
        target: poolAddress,
      });
      const posToken0 = token0.output.find(
        (t) => t.input.target.toLowerCase() === poolAddress
      ).output;
      const posToken1 = token1.output.find(
        (t) => t.input.target.toLowerCase() === poolAddress
      ).output;
      let price, otherToken;
      if (posToken0.toLowerCase() === stakingToken) {
        price = poolReserves.output[1] / poolReserves.output[0];
        otherToken = transformAddress(posToken1);
      } else {
        price = poolReserves.output[0] / poolReserves.output[1];
        otherToken = transformAddress(posToken0);
      }
      const transformedStakingToken = transformAddress(stakingToken);
      Object.values(balances).forEach((balance) => {
        Object.entries(balance).forEach(([addr, bal]) => {
          if (addr.toLowerCase() === transformedStakingToken) {
            balance[otherToken] = BigNumber(bal).times(price).toFixed(0);
            delete balance[addr];
          }
        });
      });
    }

    if (["smartbch", "cronos"].includes(chain)) {
      const fixBalances = await getFixBalances(chain);
      Object.values(balances).map(fixBalances);
    }
    return balances;
  }

  function getTvlPromise(key) {
    return async (ts, _block, chainBlocks) => {
      if (!balanceResolve) balanceResolve = getTvl(ts, _block, chainBlocks);
      return (await balanceResolve)[key];
    };
  }

  return {
    methodology: "TVL includes all farms in MasterChef contract",
    [chain]: {
      staking: getTvlPromise("staking"),
      pool2: getTvlPromise("pool2"),
      masterchef: getTvlPromise("tvl"),
      tvl: getTvlPromise("tvl"),
    },
  };
}
module.exports = {
  methodology: `Counts tokens held in the masterchef contract(0x23e2DA1657C2b552185d7AF485d6f4825f68200a)`,
  ...masterChefExports(masterchef, "fantom", "", false),
}; // node test.js projects/furylabsfinance/index.js
