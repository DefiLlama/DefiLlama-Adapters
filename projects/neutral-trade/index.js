const { VAULTS, START_TIMESTAMP } = require("./constants")
const { drift: { vaultTvl } } = require("../helper/chain/rpcProxy")

async function tvl(api) {
  for (const vault of VAULTS) {
    const token_tvl = await vaultTvl(vault.address, vault.version);
    api.add(vault.token.mint, token_tvl);
  }
}


module.exports = {
  start: START_TIMESTAMP,
  timetravel: false,
  methodology: "The combined TVL and PnL of all public and private vaults.",
  solana: { tvl },
};
