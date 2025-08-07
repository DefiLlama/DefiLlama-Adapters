const {
  DRIFT_VAULTS,
  KAMINO_VAULTS,
  HYPERLIQUID_VAULTS,
  NT_VAULTS,
  START_TIMESTAMP,
} = require("./constants");
const { drift: { vaultTvl: getDriftVaultTvl } } = require("../helper/chain/rpcProxy");
const { getTvl: getKaminoVaultTvl } = require("./utils/kamino");
const { getTvl: getHyperliquidVaultTvl } = require("./utils/hyperliquid");
const { getTvl: getNtVaultTvl } = require("./utils/ntVaults");

async function drift_vaults_tvl(api) {
  for (const vault of DRIFT_VAULTS) {
    const token_tvl = await getDriftVaultTvl(vault.address, vault.version);
    api.add(vault.token.mint, token_tvl);
  }
}

async function kamino_vaults_tvl(api) {
  for (const vault of KAMINO_VAULTS) {
    const token_tvl = await getKaminoVaultTvl(vault.address);
    api.add(vault.token.mint, token_tvl);
  }
}

async function hyperliquid_vaults_tvl(api) {
  for (const vault of HYPERLIQUID_VAULTS) {
    const token_tvl = await getHyperliquidVaultTvl(vault.address);
    api.add(vault.token.mint, token_tvl);
  }
}

async function nt_vaults_tvl(api) {
  for (const vault of NT_VAULTS) {
    const token_tvl = await getNtVaultTvl(vault.address);
    api.add(vault.token.mint, token_tvl);
  }
}

async function tvl(api) {
  await drift_vaults_tvl(api);
  await kamino_vaults_tvl(api);
  await hyperliquid_vaults_tvl(api);
  await nt_vaults_tvl(api);
}


module.exports = {
  start: START_TIMESTAMP,
  timetravel: false,
  doublecounted: true,
  methodology: "The combined TVL and PnL of all public and private vaults.",
  solana: { tvl },
};
