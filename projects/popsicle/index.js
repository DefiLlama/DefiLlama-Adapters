const sdk = require("@defillama/sdk");
const poolInfoAbi = require("../helper/abis/masterchef.json");

const { addFundsInMasterChef } = require("../helper/masterchef");
const {
  transformBscAddress,
  transformFantomAddress,
} = require("../helper/portedTokens");
const { fetchURL } = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");

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

async function optimizerV3(time, block){
  const data = await fetchURL("https://analytics.back.popsicle.finance/api/v1/FragolaApy");
  return toUSDTBalances(data.data.reduce((total, pool)=>total+pool.tvl, 0))
}

const ethTvl = calcTvl("ethereum");

const fantomTvl = calcTvl("fantom")

const bscTvl = calcTvl("bsc")

module.exports = {
  misrepresentedTokens: true,
  ethereum:{
    pool2: ethTvl,
    tvl: optimizerV3
  },
  bsc:{
    pool2: bscTvl
  },
  fantom:{
    pool2:fantomTvl
  },
  methodology:
    "We count pool2 liquidity staked on masterchef",
};
