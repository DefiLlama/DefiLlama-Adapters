const { drift: { vaultTvl } } = require("../helper/chain/rpcProxy");
const { VAULTS } = require("./vaults");

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "TVL is calculated by summing net value asset in vaults.",
  solana: {
    tvl,
  },
};

async function tvl(api) {
    for (const vault of VAULTS) {
        const netValue = await vaultTvl(vault.address, vault.version);
        api.add(vault.underlying, netValue);
    }
}