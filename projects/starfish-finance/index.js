const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking.js");
const { onChainTvl } = require("../helper/balancer");

const addresses = {
  astar: {
    seanStaking: "0xa86dc743efBc24AF4c1FC5d150AaDb4DCF52c868",
    seanToken: "0xEe8138B3bd03905cF84aFE10cCD0dCcb820eE08E",
  },
};

module.exports = {
  astar: {
    tvl: onChainTvl('0x496F6125E1cd31f268032bd4cfaA121D203639b7', 3258352, {
      preLogTokens: [
        '0xEa093b81ca103585FC8Df82CB3D5D7F2e394AB70',
        ADDRESSES.astar.SDN,
        '0xEe8138B3bd03905cF84aFE10cCD0dCcb820eE08E',
        ADDRESSES.astar.BAI,
        ADDRESSES.astar.DAI,
        ADDRESSES.astar.DOT,
        '0x5E60Af4d06A9fc89eb47B39b5fF1b1b42a19ef39',
        ADDRESSES.moonbeam.USDC,
        '0xfFFfffFF000000000000000000000001000007C0',
        ADDRESSES.astar.USDT,
      ]
    }),
    staking: staking(addresses.astar.seanStaking, addresses.astar.seanToken,),
  },
};
