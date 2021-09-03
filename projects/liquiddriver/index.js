const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");
const {addFundsInMasterChef} = require('../helper/masterchef');
const staking = require("../helper/staking");

// --- All sushitokens lp tokens are staked here for LQDR tokens ---
const MASTERCHEF = "0x742474dae70fa2ab063ab786b1fbe5704e861a0c";

const LQDR = "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9"
const xLQDR = '0x3Ae658656d1C526144db371FaEf2Fff7170654eE'

const fantomTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformFantomAddress();

  await addFundsInMasterChef(balances, MASTERCHEF, chainBlocks.fantom, 'fantom', transformAddress, abi.poolInfo)

  return balances
};

module.exports = {
  staking:{
    tvl: staking(xLQDR, LQDR, 'fantom', 'fantom:'+LQDR)
  },
  fantom: {
    tvl: fantomTvl,
  },
  tvl: sdk.util.sumChainTvls([fantomTvl]),
};
