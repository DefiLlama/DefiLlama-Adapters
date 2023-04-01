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
        '0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4',
        '0xEe8138B3bd03905cF84aFE10cCD0dCcb820eE08E',
        '0x733ebcC6DF85f8266349DEFD0980f8Ced9B45f35',
        '0x6De33698e9e9b787e09d3Bd7771ef63557E148bb',
        '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF',
        '0x5E60Af4d06A9fc89eb47B39b5fF1b1b42a19ef39',
        '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98',
        '0xfFFfffFF000000000000000000000001000007C0',
        '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283',
      ]
    }),
    staking: staking(addresses.astar.seanStaking, addresses.astar.seanToken,),
  },
};
