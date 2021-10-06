const sdk = require("@defillama/sdk");
const poolInfoAbi = require("../helper/abis/masterchef.json");

const { addFundsInMasterChef } = require("../helper/masterchef");
const {
  transformBscAddress,
  transformFantomAddress,
} = require("../helper/portedTokens");

const MasterChefContract = "0xbf513aCe2AbDc69D38eE847EFFDaa1901808c31c";
const ice = '0xf16e81dce15B08F326220742020379B855B87DF9'

function calcTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    const transformAddressBsc = await transformBscAddress();
    const transformAddressFtm = await transformFantomAddress();

    await addFundsInMasterChef(
      balances,
      MasterChefContract,
      chainBlocks[chain],
      chain,
      chain == "bsc" || chain == "fantom"
        ? chain == "bsc"
          ? transformAddressBsc
          : transformAddressFtm
        : (addr) => addr,
      poolInfoAbi.poolInfo,
      [ice]
    );

    return balances;
  }
};

const ethTvl = calcTvl("ethereum");

const fantomTvl = calcTvl("fantom")

const bscTvl = calcTvl("bsc")

module.exports = {
  tvl: async () => ({}),
  ethereum:{
    pool2: ethTvl
  },
  bscTvl:{
    pool2: bscTvl
  },
  fantomTvl:{
    pool2:fantomTvl
  },
  methodology:
    "We count pool2 liquidity staked on masterchef",
};
