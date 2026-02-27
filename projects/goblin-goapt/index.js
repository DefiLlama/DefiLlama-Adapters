const { function_view } = require("../helper/chain/aptos");
const ADDRESSES = require('../helper/coreAssets.json')

async function _getTotalStake() {
  const result = await function_view({
    functionStr: "0x655b6d54dc873da2d900d6e588a47dd8ce5b4a0acfff046cb25cb0da1e234a20::apt_lst::total_stake",
    args: [],
    type_arguments: [],
  });

  return result[0];
}

module.exports = {
  timetravel: false,
  methodology: "Counts the total APT Staked on goblin.",
  aptos: {
    tvl: async (api) => {
      const totalAptSupply = await _getTotalStake();
      api.add(ADDRESSES.aptos.APT, totalAptSupply);
    },
  },
};

