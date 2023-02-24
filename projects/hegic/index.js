const sdk = require("@defillama/sdk");
const { token } = require("@project-serum/anchor/dist/cjs/utils");
const { sumTokens } = require("../helper/unwrapLPs");

const poolsV8888 = {
  ETH_CALL: "0xb9ed94c6d594b2517c4296e24A8c517FF133fb6d",
  ETH_PUT: "0x790e96E7452c3c2200bbCAA58a468256d482DD8b",
  WBTC_CALL: "0xfA77f713901a840B3DF8F2Eb093d95fAC61B215A",
  WBTC_PUT: "0x7A42A60F8bA4843fEeA1bD4f08450D2053cC1ab6",
};

const tokens = {
  ETH: "0x0000000000000000000000000000000000000000",
  WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  HEGIC: "0x584bc13c7d411c00c01a62e8019472de68768430",
};

const arbitrum = {
  hergeCoverPool: "0xd47Ef934e301E0ee3b1cE0e3EEbCb64De8b231BE",
  hergePayoff: "0x822C0E3aFbCfbD166833F44AD82f28354a57cf28",
  hergeOperationalTreasury: "0xec096ea6eB9aa5ea689b0CF00882366E92377371",
  HEGIC: "0x431402e8b9de9aa016c743880e04e517074d8cec",
  USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
  hardcoreStakeAndCover: "0x60898dfA3C6e8Ba4998B5f3be25Fb0b0b69d5D5d",
  hardcoreOperationalTreasury: "0xB0F9F032158510cd4a926F9263Abc86bAF7b4Ab3",
};

async function ethTvl(_timestamp, ethBlock) {
  const ethV1 = (
    await sdk.api.eth.getBalance({
      target: "0x878f15ffc8b894a1ba7647c7176e4c01f74e140b",
      block: ethBlock,
    })
  ).output;
  const btcV1 = (
    await sdk.api.erc20.balanceOf({
      target: tokens.WBTC,
      owner: "0x20DD9e22d22dd0a6ef74a520cb08303B5faD5dE7",
      block: ethBlock,
    })
  ).output;

  const balances = {
    [tokens.WBTC]: btcV1,
    [tokens.ETH]: ethV1,
  };

  // V2
  await sumTokens(
    balances,
    [
      [tokens.WBTC, poolsV8888.WBTC_CALL],
      [tokens.USDC, poolsV8888.WBTC_PUT],
      [tokens.USDC, poolsV8888.ETH_PUT],
      [tokens.WETH, poolsV8888.ETH_CALL],
    ],
    ethBlock
  );

  return balances;
}

async function arbiTvl(timestamp, block, chainBlocks) {
  return await sumTokens({}, [
    [arbitrum.USDC, arbitrum.hardcoreOperationalTreasury],
    [arbitrum.USDC, arbitrum.hardcoreStakeAndCover],
    [arbitrum.USDC, arbitrum.hergeOperationalTreasury],
    [arbitrum.USDC, arbitrum.hergePayoff],
    [arbitrum.HEGIC, arbitrum.hergeCoverPool],
  ], chainBlocks.arbitrum, "arbitrum", token => ({
    [arbitrum.USDC] : tokens.USDC,
    [arbitrum.HEGIC]: tokens.HEGIC,
  })[token]);
}

// node test.js projects/hegic/index.js
module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  arbitrum: {
    tvl: arbiTvl,
  },
  methodology: `TVL for Hegic is calculated using the HEGIC tokens deposited into Stake & Cover pool on Arbitrum and pools liquidity in USDC, ETH and WBTC`,
};
