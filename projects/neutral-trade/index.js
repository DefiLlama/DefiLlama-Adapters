const {
  DRIFT_VAULTS,
  KAMINO_VAULTS,
  HYPERLIQUID_VAULTS,
  NT_VAULTS,
  START_TIMESTAMP,
} = require("./constants");
const { getTvl: getDriftVaultTvl } = require("./utils/drift");
const { getTvl: getKaminoVaultTvl } = require("./utils/kamino");
const { getTvl: getHyperliquidVaultTvl } = require("./utils/hyperliquid");
const { getTvl: getNtVaultTvl } = require("./utils/ntVaults");

async function drift_vaults_tvl(api) {
  await getDriftVaultTvl(api, DRIFT_VAULTS.map(vault => vault.address));
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
  doublecounted: false,
  methodology: "The combined TVL and PnL of all public and private vaults.",
  solana: { tvl },
};
