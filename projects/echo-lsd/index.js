const { function_view } = require("../helper/chain/aptos");

async function getTVL() {
  const totalTVL = await function_view({ functionStr: "0xa0281660ff6ca6c1b68b55fcb9b213c2276f90ad007ad27fd003cf2f3478e96e::lsdmanage::total_staked_apt", })
  return {
    aptos: +totalTVL / 1e8
  }
}

module.exports = {
  aptos: {
    tvl: getTVL
  },
};
