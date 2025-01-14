const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { pool2 } = require("../helper/pool2");

const Contracts = {
  Pool: "0xd91bBA888c1F80BeD01b66830D006c26a7e8625c",
  Chef: "0xFc81F6cd9F99A00D42aF4a97767B84Cd456Aa909",
  DIP_ETH_LBP: "0xF2DDfFEd949EEA23F838C8518A48E4D09Cac9b18",
  Tokens: {
    axlBTC: "0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad",
    ETH: ADDRESSES.base.WETH,
    USDbC: ADDRESSES.base.USDbC,
  },
  DIP_ETH_LP: "0x0BE2EF4a1CC597dDd2a354505E08d7934802029d"
}

async function tvl(api) {
  return sumTokens2({ api, owner: Contracts.Pool, tokens: Object.values(Contracts.Tokens) })
}

module.exports = {
  base: {
    tvl,
    pool2: pool2(Contracts.DIP_ETH_LBP, Contracts.DIP_ETH_LP),
  },
  hallmarks: [
    [Math.floor(new Date('2023-08-14') / 1e3), 'Referral contract exploited'],
  ],
};
