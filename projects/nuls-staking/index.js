const { get } = require('../helper/http')

async function staking() {
  return {
    'nuls': (await get("https://public1.nuls.io/nuls/assets/all/get")).data.deposit
  };
}

module.exports = {
  timetravel: false,
  nuls: {
    tvl: async ()=> ({}),
    staking,
  }
};
