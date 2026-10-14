const { sumTokensExport } = require("../helper/sumTokens");
const ADDRESSES = require("../helper/coreAssets.json");

const contracts = {
  ethereum: "0x558FCAcE07fBf6A3D4449240685f29Ad6669fd81",
  optimism: "0xB9C1EC4647301828Bb10f6B52584201D1C16bC8F",
  bsc: "0x777108936Ed411b0598c1E35266FD92e76Cf834d",
  polygon: "0x4f48c6a228a0bf0c03dc53765930c0cb06f1ecd0",
  base: "0xe26a4561b3d213f1479196e43fc532fb89142abd",
  arbitrum: "0xAC66779A566143069A8E8590bDeaBe685054927F",
};

const stablecoins = {
  ethereum: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT],
  optimism: [ADDRESSES.optimism.USDC, ADDRESSES.optimism.USDC_CIRCLE, ADDRESSES.optimism.USDT],
  bsc: [ADDRESSES.bsc.USDC, ADDRESSES.bsc.USDT],
  polygon: [ADDRESSES.polygon.USDC, ADDRESSES.polygon.USDC_CIRCLE, ADDRESSES.polygon.USDT],
  base: [ADDRESSES.base.USDC],
  arbitrum: [ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDT],
};

const adapter = {
  methodology: "Counts USDC and USDT balances held by Everstrike's custody contract on each supported chain. Includes native and legacy bridged USDC where both are deployed.",
};

for (const [chain, owner] of Object.entries(contracts)) {
  adapter[chain] = {
    tvl: sumTokensExport({ owner, tokens: stablecoins[chain] }),
  };
}

module.exports = adapter;
