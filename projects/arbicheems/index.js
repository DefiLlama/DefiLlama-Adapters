const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');

const cheems = "0x75a2f30929C539E7d4eE033c9331b89F879c0cf7";
const stakingContract = "0xaaCcB989FE1084c6935f09aE4BBD49AfF58Bdb94";

const mim = ADDRESSES.arbitrum.MIM;
const mimPool = "0x79F12596B78F9E982bDaB6e2d83D4bc155672372";
const ethPool = "0xd495Beb0011e3DFEC0C93376f5216C1C3dD01C23";

const cheemsEthPool = "0x1382EcDf09507ba87022c79312DfAfb2A5063d73";
const cheemsEthSLP = "0xce786f1f3d3025fe4a64e37d28fa76311ff5253f";

module.exports = {
  deadFrom: '2022-02-22',
  arbitrum: {
    tvl: sumTokensExport({ tokensAndOwners: [[nullAddress, ethPool], [mim, mimPool]] }),
    staking: staking(stakingContract, cheems,),
    pool2: pool2(cheemsEthPool, [cheemsEthSLP],),
  },
};
