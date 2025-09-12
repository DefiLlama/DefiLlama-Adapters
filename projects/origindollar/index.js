const abi = require("./abi.json");
const { staking } = require("../helper/staking");

const vault = "0xE75D77B1865Ae93c7eaa3040B038D7aA7BC02F70";

const ethTvl = async (api) => {
  const tokens = await api.call({  abi: abi.getAllAssets, target: vault})
  const bals = await api.multiCall({  abi: abi.checkBalance, calls: tokens, target: vault})
  api.add(tokens, bals)
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking: staking(
      "0x63898b3b6Ef3d39332082178656E9862bee45C57", "0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26",
    ),
  },
};
