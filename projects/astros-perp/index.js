const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui")

// Configuration: ActiveVault object instance address
// Type: 0x882cd9388d35a141614a7beb28ec14f7aaf54f8372ccc1dd64046efd82866043::active_vault::ActiveVault<0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC>
const ACTIVE_VAULT_ID = "0xa33c96502b89cdfd177333c35d70b95451547d223a0d0abc5faeee82793500ab"

async function tvl(api) {
  const vault = await sui.getObject(ACTIVE_VAULT_ID);
  const typeString = vault.type.replace(">", "").split("<")[1];
  const tokenType = typeString;
  const balance = vault.fields.balance;
  api.add(tokenType, balance);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
}
