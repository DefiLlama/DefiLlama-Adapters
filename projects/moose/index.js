const { drift: { vaultTvl } } = require("../helper/chain/rpcProxy");
const { VAULTS } = require("./vaults");

async function tvl(api) {
  for (const vault of VAULTS) {
    const netValue = await vaultTvl(vault.address, vault.version);
    api.add(vault.underlying, netValue);
  }
}

module.exports = {
  deadFrom: '2025-05-17',
  timetravel: false,
  doublecounted: true,
  methodology: "TVL is calculated by summing net value asset in vaults.",
  solana: { tvl },
};

