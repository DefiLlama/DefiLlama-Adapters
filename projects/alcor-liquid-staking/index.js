const { get_account_tvl } = require("../helper/chain/eos");

// Alcor Liquid Staking: WAX staked through liquid.alcor, represented by LSW (lsw.alcor).
async function wax() {
  return await get_account_tvl(["liquid.alcor"], [["eosio.token", "WAX", "wax"]], "wax");
}

module.exports = {
  methodology: `TVL is the WAX held and staked (CPU/NET, plus pending refunds) by the liquid.alcor contract.`,
  wax: { tvl: wax },
}
