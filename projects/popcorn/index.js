const { ADDRESSES } = require("./constants");
const { addVaultToTVL } = require("./vault");
const { addFraxVaultToTVL } = require("./fraxVault");
const { staking } = require("../helper/staking");

function getTVL(chain = undefined) {
  return async (timestamp, block, chainBlocks, { api }) => {
    let balances = {};

    await addVaultToTVL(balances, api, ADDRESSES[chain].vaultRegistry);

    if (chain === "arbitrum") {
      await addFraxVaultToTVL(balances, api);
    }

    return balances;
  }
}

const veVCX = "0x0aB4bC35Ef33089B9082Ca7BB8657D7c4E819a1A";
const WETH_VCX_BAL_LP_TOKEN = "0x577A7f7EE659Aa14Dc16FD384B3F8078E23F1920";

module.exports = {
  timetravel: true,
  methodology: ``,
  ethereum: {
    start: 12237585,
    staking: staking(veVCX, WETH_VCX_BAL_LP_TOKEN),
    tvl: getTVL('ethereum'),
  },
  bsc: {
    tvl: getTVL('bsc'),
  },
  polygon: {
    tvl: getTVL('polygon'),
  },
  arbitrum: {
    tvl: getTVL('arbitrum'),
  },
  optimism: {
    tvl: getTVL('optimism'),
  }
};