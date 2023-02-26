const { get } = require('../helper/http')

async function staking() {
  return {
    'nuls': (await get("https://pocm.nuls.io/api/pocm/info")).data.totalStaking
  };
}

module.exports = {
  timetravel: false,
  nuls: {
    tvl: async ()=> ({}),
    staking,
  }
};
