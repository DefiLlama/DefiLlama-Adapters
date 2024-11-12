const { getConnection, sumTokens2 , } = require("../helper/solana");
const { ManifestClient, utils} = require("@cks-systems/manifest-sdk");

async function tvl() {
  const connection = getConnection();
  const marketPks = await ManifestClient.listMarketPublicKeys(connection);

  const vaultAccounts = [];
  let globalAccounts = [];
  for (const pk of marketPks) {
    const manifestClient = await ManifestClient.getClientReadOnly(connection, pk);
    const baseVaultPk = utils.getVaultAddress(pk, manifestClient.market.baseMint());
    const quoteVaultPk = utils.getVaultAddress(pk, manifestClient.market.quoteMint());
    vaultAccounts.push(baseVaultPk);
    vaultAccounts.push(quoteVaultPk);

    const baseGlobalPk = utils.getGlobalVaultAddress(manifestClient.market.baseMint());
    const quoteGlobalPk = utils.getGlobalVaultAddress(manifestClient.market.quoteMint());
    globalAccounts.push(baseGlobalPk);
    globalAccounts.push(quoteGlobalPk);
  }
  // Global vaults can be repeated, so only look at uniques.
  globalAccounts = globalAccounts.filter((value, index, array) => array.indexOf(value) === index);

  const tokenAccounts = vaultAccounts.concat(globalAccounts);
  return sumTokens2({ tokenAccounts, allowError: true })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};