const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { default: BigNumber } = require("bignumber.js");

const CALL_SSOVS = [
  // Monthlies
  // DPX Monthly CALL SSOV
  [
    "0x05E7ACeD3b7727f9129E6d302B488cd8a1e0C817",
    "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55",
  ],
  // rDPX Monthly CALL SSOV
  [
    "0xd74c61ca8917Be73377D74A007E6f002c25Efb4e",
    "0x32eb7902d4134bf98a28b963d26de779af92a212",
  ],
  // stETH Monthly CALL SSOV
  [
    "0x475a5a712B741b9Ab992E6Af0B9E5adEE3d1851B",
    "0x5979D7b546E38E414F7E9822514be443A4800529",
  ],
  // ARB Monthly CALL SSOV
  [
    "0xDF3d96299275E2Fb40124b8Ad9d270acFDcc6148",
    "0x912ce59144191c1204e64559fe8253a0e49e6548",
  ],
  // Weeklies
  // DPX Weekly CALL SSOV
  [
    "0x10FD85ec522C245a63239b9FC64434F58520bd1f",
    "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55",
  ],
  // rDPX Weekly CALL SSOV
  [
    "0xCdaACF37726Bf1017821b5169e22EB34734B28A8",
    "0x32eb7902d4134bf98a28b963d26de779af92a212",
  ],
  // stETH Weekly CALL SSOV
  [
    "0xFca61E79F38a7a82c62f469f55A9df54CB8dF678",
    "0x5979D7b546E38E414F7E9822514be443A4800529",
  ],
];

const PUT_SSOVS = [
  // DPX Weekly PUT SSOV
  "0xf71b2B6fE3c1d94863e751d6B455f750E714163C",
  // rDPX Weekly PUT SSOV
  "0xb4ec6B4eC9e42A42B0b8cdD3D6df8867546Cf11d",
  // ETH Weekly PUT SSOV
  "0x32449DF9c617C59f576dfC461D03f261F617aD5a",
];

async function callSsovTvl(balances, vaults, block, chain) {
  const currentEpochs = (
    await sdk.api.abi.multiCall({
      calls: vaults.map((p) => ({
        target: p[0],
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

  for (let i = 0; i < vaults.length; i++) {
    const isExpired =
      Number(epochTimes[i].output[1]) * 1000 < new Date().getTime();

    const token = `${chain}:${vaults[i][1]}`;
    const balance = isExpired
      ? "1"
      : epochData[i].output.totalCollateralBalance;
    sdk.util.sumSingleBalance(balances, token, balance);
  }
}

async function putSsovTvl(balances, vaults, block, chain) {
  const currentEpochs = (
    await sdk.api.abi.multiCall({
      calls: vaults.map((p) => ({
        target: p,
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
      target: PUT_SSOVS[0],
      abi: abi.getCollateralPrice,
      block,
      chain,
    })
  ).output;

  for (let i = 0; i < vaults.length; i++) {
    const isExpired =
      Number(epochTimes[i].output[1]) * 1000 < new Date().getTime();

    let balance = isExpired ? "1" : epochData[i].output.totalCollateralBalance;
    const token = `${chain}:${ADDRESSES.arbitrum.USDT}`;
    balance = BigNumber(twoCrvPrice)
      .times(Number(epochData[i].output.totalCollateralBalance))
      .div(1e20)
      .toFixed(0);
    sdk.util.sumSingleBalance(balances, token, balance);
  }
}

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};

  await callSsovTvl(balances, CALL_SSOVS, chainBlocks.arbitrum, "arbitrum");
  await putSsovTvl(balances, PUT_SSOVS, chainBlocks.arbitrum, "arbitrum");

  return balances;
}

module.exports = {
  arbitrum: {
    tvl,
  },
};
