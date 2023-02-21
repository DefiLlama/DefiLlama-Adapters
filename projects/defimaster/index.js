const sdk = require("@defillama/sdk");
const { abi } = require("@defillama/sdk/build/api");
const { transformArbitrumAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const _abiMap = {
  balanceOf: {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  poolLength: {
    inputs: [],
    name: "poolLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  realLp: {
    inputs: [
      {
        internalType: "uint256",
        name: "pid",
        type: "uint256",
      },
    ],
    name: "realLp",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  poolInfo: {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "poolInfo",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "lpToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allocPoint",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastRewardTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "accSushiPerShare",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isVault",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
};

const chefArbitrum = "0x2F9805038114B9DDcf99316a5b4Db2eC820322D3";


async function TVLPools(timestamp, ethBlock, chainBlock) {
  const balances = {};

  const block = chainBlock.arbitrum;
  const chain = "arbitrum";
  const poolLength = (
    await sdk.api.abi.call({
      target: chefArbitrum,
      abi: _abiMap.poolLength,
      block,
      chain,
    })
  ).output;
  let lpCalls = [];
  let realLpCalls = [];
  for (let i = 0; i < poolLength; i++) {
    lpCalls.push({
      target: chefArbitrum,
      params: i,
    });
    realLpCalls.push({
      target: chefArbitrum,
      params: i,
    });
  }
  let realLps = (
    await sdk.api.abi.multiCall({
      abi: _abiMap.realLp,
      calls: realLpCalls,
      block,
      chain,
    })
  ).output.map((x) => x.output);

  const pools = (
    await sdk.api.abi.multiCall({
      abi: _abiMap.poolInfo,
      calls: lpCalls,
      block,
      chain,
    })
  ).output.map((x) => {
    return x.output;
  });


  let lpBalances = (
    await sdk.api.abi.multiCall({
      abi: _abiMap.balanceOf,
      calls: pools.map((pool) => {
        return {
          target: pool[0],
          params: chefArbitrum,
        };
      }),
      block,
      chain,
    })
  ).output.map((x) => x.output);

  const lpPositions = lpBalances.map((b, i) => ({
    balance: b,
    token: realLps[i]
  }));

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    await transformArbitrumAddress()
  );

  return balances
}

module.exports = {
  methodology: `Total value in MasterChef`,
  misrepresentedTokens: true,
  arbitrum: {
    tvl: TVLPools,
  },
};
