const { ADDRESSES } = require("./constants");
const { addVaultToTVL } = require("./vault");
const { addFraxVaultToTVL } = require("./fraxVault");

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

module.exports = {
  timetravel: true,
  methodology: ``,
  ethereum: {
    start: 12237585,
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