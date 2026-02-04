const { sumTokens2 } = require("../helper/chain/cardano");

const NON_CUSTODIAL_VAULT_ADDRESS = 'addr1wypmdhdv6cxvr67ea4qyr5xznrzvday2kc0qflddfkg4e7scahru0'
const CONTRACT_ADDRESSES = [NON_CUSTODIAL_VAULT_ADDRESS]

async function tvl() {
  const assetsLocked = await sumTokens2({
    owners: CONTRACT_ADDRESSES
  })
  return assetsLocked
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  }
};
