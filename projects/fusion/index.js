// const { masterChefExports } = require('../helper/masterchef');
const { stakings } = require('../helper/staking');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getUniTVL } = require('../helper/unknownTokens');
const { mergeExports } = require('../helper/utils');

// const masterchef = '0x00501Ed66d67B1127809E54395F064e256b75B23'
const sntFantom = '0x69D17C151EF62421ec338a0c92ca1c1202A427EC'
const sntNova = '0x657a66332a65b535da6c5d67b8cd1d410c161a08'
const callStake = "0xe9749a786c77A89fd45dAd3A6Ad1022eEa897F97";
const bondStake = "0xaaBaB0FB0840DFfFc93dbeed364FB46b1ffD92EE";
const nullAddress = '0x0000000000000000000000000000000000000000'
const dexFactory = '0x9550b0c83AD5a58898cD4267987Af67e7E52bF55'
const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');

config.setProvider("nova", new ethers.providers.StaticJsonRpcProvider(
  "http://dataseed-0.rpc.novanetwork.io:8545/",
  {
    name: "nova",
    chainId: 87,
  }
))

// const masterchefExport = {
//   timetravel: true,
//   misrepresentedTokens: false,
//   ...masterChefExports(masterchef, 'fantom', sntFantom, true),
//   // ...masterChefExports(masterchef, 'nova', sntNova, true),
// }


const dexTVL = {
  nova: {
    tvl: getUniTVL({
      factory: dexFactory,
      chain: "nova",
      coreAssets: [
        sntNova
      ],
    })
  },
  fantom: {
    tvl: getUniTVL({
      factory: dexFactory,
      chain: "fantom",
      coreAssets: [],
    })
  }
}

const stakingExports = {
  fantom: {
    staking: stakings([callStake, bondStake], sntFantom, 'fantom'),
  },
  nova: {
    staking: async (_, _b, { nova: block }) => sumTokens2({ owners: [callStake, bondStake,], tokens: [nullAddress, sntNova], chain: 'nova', block, })
  },
}

module.exports = mergeExports([dexTVL, stakingExports,])