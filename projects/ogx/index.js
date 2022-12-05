const { get_account_tvl } = require("../helper/chain/eos");

// OGX
// https://ogx.network
async function eos() {
  return await get_account_tvl("synth.ogx", [["core.ogx", "OGX", "organix"]]);
}

module.exports = {
  methodology: `Organix TVL is achieved by querying token balances from OGX's Synth smart contract.`,
  eos: {
    tvl: eos
  },
}