// Blockfrost transport lives in @defillama/sdk (`sdk.chains.cardano`, reads BLOCKFROST_PROJECT_ID / CARDANO_BLOCKFROST);
// this module keeps the historical function names and result shapes.
require('../../env') // seeds BLOCKFROST_PROJECT_ID into process.env for the sdk
const { cardano } = require('@defillama/sdk').chains

async function getAddressesUTXOs(address) {
  return cardano.getAddressUtxos({ address })
}

// `{ unit, quantity }[]` held by the address (empty for unused addresses)
async function getAssets(address) {
  return cardano.getAddressAssets({ address })
}


async function assetsAddresses(address) {
  return cardano.getAssetAddresses({ assetId: address })
}

async function addressesUtxosAssetAll(address, asset) {
  return cardano.getAddressUtxosByAsset({ address, asset })
}

async function getTxUtxos(tx_hash) {
  return cardano.getTxUtxos({ txHash: tx_hash })
}

async function getTxsRedeemers(utxo) {
  return cardano.getTxRedeemers({ txHash: utxo })
}

async function getTxsMetadata(utxo) {
  return cardano.getTxMetadata({ txHash: utxo })
}

async function getScriptsDatum(datumHash) {
  return cardano.getScriptDatum({ datumHash })
}

async function getTokensMinted(tokenId) {
  const asset = await cardano.getAsset({ assetId: tokenId })
  if (!asset) throw new Error(`[cardano] asset ${tokenId} not found`)
  return Number(asset.quantity)
}

// `{ address }[]` rows of every payment address controlled by a stake key
async function getAccountAddresses(account) {
  return cardano.blockfrostAll({ path: `/accounts/${account}/addresses` })
}

module.exports = {
  getAssets,
  getAddressesUTXOs,
  getTxUtxos,
  getTxsRedeemers,
  getTxsMetadata,
  assetsAddresses,
  addressesUtxosAssetAll,
  getTokensMinted,
  getScriptsDatum,
  getAccountAddresses
}
