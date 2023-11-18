const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const ADDRESSES = require("../helper/coreAssets.json");
const { cachedGraphQuery } = require("../helper/cache");
const {
  getAmountsForLiquidity,
  getSqrtRatioAtTick,
} = require("../helper/dopex");

const abi = require("./abi.json");

const SSOVS = [
  // Monthlies
  // DPX Monthly CALL SSOV
  {
    address: "0x05E7ACeD3b7727f9129E6d302B488cd8a1e0C817",
    underlying: "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55",
    isPut: false,
  },

  // rDPX Monthly CALL SSOV
  {
    address: "0xd74c61ca8917Be73377D74A007E6f002c25Efb4e",
    underlying: "0x32eb7902d4134bf98a28b963d26de779af92a212",
    isPut: false,
  },
  // stETH Monthly CALL SSOV
  {
    address: "0x475a5a712B741b9Ab992E6Af0B9E5adEE3d1851B",
    underlying: "0x5979D7b546E38E414F7E9822514be443A4800529",
    isPut: false,
  },
  // ARB Monthly CALL SSOV
  {
    address: "0xDF3d96299275E2Fb40124b8Ad9d270acFDcc6148",
    underlying: "0x912ce59144191c1204e64559fe8253a0e49e6548",
    isPut: false,
  },
  // Weeklies
  // DPX Weekly CALL SSOV
  {
    address: "0x10FD85ec522C245a63239b9FC64434F58520bd1f",
    underlying: "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55",
    isPut: false,
  },
  // rDPX Weekly CALL SSOV
  {
    address: "0xCdaACF37726Bf1017821b5169e22EB34734B28A8",
    underlying: "0x32eb7902d4134bf98a28b963d26de779af92a212",
    isPut: false,
  },
  // stETH Weekly CALL SSOV
  {
    address: "0xFca61E79F38a7a82c62f469f55A9df54CB8dF678",
    underlying: "0x5979D7b546E38E414F7E9822514be443A4800529",
    isPut: false,
  },
  // DPX Weekly PUT SSOV
  { address: "0xf71b2B6fE3c1d94863e751d6B455f750E714163C", isPut: true },
  // rDPX Weekly PUT SSOV
  { address: "0xb4ec6B4eC9e42A42B0b8cdD3D6df8867546Cf11d", isPut: true },
  // ETH Weekly PUT SSOV
  { address: "0x32449DF9c617C59f576dfC461D03f261F617aD5a", isPut: true },
];

async function ssovTvl(balances, vaults, block, chain) {
  const currentEpochs = (
    await sdk.api.abi.multiCall({
      calls: vaults.map((p) => ({
        target: p.address,
      })),
      abi: abi.currentEpoch,
      block,
      chain,
    })
  ).output;

  const epochData = (
    await sdk.api.abi.multiCall({
      calls: currentEpochs.map((p) => {
        return {
          target: p.input.target,
          params: p.output,
        };
      }),
      abi: abi.getEpochData,
      block,
      chain,
    })
  ).output;

  const epochTimes = (
    await sdk.api.abi.multiCall({
      calls: currentEpochs.map((p) => {
        return {
          target: p.input.target,
          params: p.output,
        };
      }),
      abi: abi.getEpochTimes,
      block,
      chain,
    })
  ).output;

  const twoCrvPrice = (
    await sdk.api.abi.call({
      target: SSOVS[7].address, // Select the first PUT ssov
      abi: abi.getCollateralPrice,
      block,
      chain,
    })
  ).output;

  for (let i = 0; i < vaults.length; i++) {
    const isExpired =
      Number(epochTimes[i].output[1]) * 1000 < new Date().getTime();

    let token;
    let balance;

    if (vaults[i].isPut) {
      token = `${chain}:${ADDRESSES.arbitrum.USDT}`;
      balance = BigNumber(twoCrvPrice)
        .times(Number(epochData[i].output.totalCollateralBalance))
        .div(1e20)
        .toFixed(0);
    } else {
      token = `${chain}:${vaults[i].underlying}`;
      balance = isExpired ? "1" : epochData[i].output.totalCollateralBalance;
    }

    sdk.util.sumSingleBalance(balances, token, balance);
  }
}

const uniV3Pools = [
  "0xcDa53B1F66614552F834cEeF361A8D12a0B8DaD8",
  "0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443",
  "0xac70bD92F89e6739B3a08Db9B6081a923912f73D",
  "0x2f5e87C9312fa29aed5c179E456625D79015299c",
  "0xC6F780497A95e246EB9449f5e4770916DCd6396A",
];

const query = `
 {
  strikes(
    first: 1000
    skip: 0
  ) {
    pool
    token0 {
      id
    }
    token1 {
      id
    }
    tickLower
    tickUpper
    totalLiquidity
  }
}
`;

async function clammTvl(balances, block, chain) {
  let sqrtPrices = (
    await sdk.api.abi.multiCall({
      calls: uniV3Pools.map((addr) => {
        return {
          target: addr,
        };
      }),
      abi: abi.slot0,
      block,
      chain,
    })
  ).output;

  sqrtPrices = sqrtPrices.reduce((acc, item) => {
    return {
      ...acc,
      [item.input.target.toLowerCase()]: item.output.sqrtPriceX96,
    };
  }, {});

  const { strikes } = await cachedGraphQuery(
    "dopex",
    "http://api.0xgraph.xyz/subgraphs/name/dopex-v2-clamm-public",
    query
  );

  const tvls = strikes.reduce(
    (acc, { totalLiquidity, tickLower, tickUpper, token0, token1, pool }) => {
      const { amount0, amount1 } = getAmountsForLiquidity(
        BigInt(sqrtPrices[pool]),
        getSqrtRatioAtTick(BigInt(tickLower)),
        getSqrtRatioAtTick(BigInt(tickUpper)),
        BigInt(totalLiquidity)
      );

      return {
        ...acc,
        [token0.id]: acc[token0.id] ? acc[token0.id] + amount0 : amount0,
        [token1.id]: acc[token1.id] ? acc[token1.id] + amount1 : amount1,
      };
    },
    {}
  );

  Object.keys(tvls).forEach((key) => {
    const token = `${chain}:${key}`;
    sdk.util.sumSingleBalance(balances, token, tvls[key].toString());
  });
}

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};

  await ssovTvl(balances, SSOVS, chainBlocks.arbitrum, "arbitrum");
  await clammTvl(balances, chainBlocks.arbitrum, "arbitrum");

  return balances;
}

module.exports = {
  arbitrum: {
    tvl,
  },
};
