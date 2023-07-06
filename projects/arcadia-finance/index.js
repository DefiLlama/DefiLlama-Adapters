const { addVaultAssets, addPoolTVL } = require("./helper");
async function tvlOptimism(timestamp, ethBlock, { optimism: block }, { api }) {
  await addPoolTVL(timestamp, ethBlock, "optimism", api)
  await addVaultAssets(timestamp, ethBlock, "optimism", api)
}



async function tvlEthereum(timestamp, ethBlock, { ethereum: block }, { api }) {
  await addPoolTVL(timestamp, ethBlock, "ethereum", api)
  await addVaultAssets(timestamp, ethBlock, "ethereum", api)
}

module.exports = {
  methodology:
    "TVL includes ERC-20 tokens that have been supplied as collateral as well as ERC-20 tokens that are supplied by liquidity providers.",
  optimism:{
    tvl:tvlOptimism
  },
  ethereum:{
    tvl:tvlEthereum
  },
};
