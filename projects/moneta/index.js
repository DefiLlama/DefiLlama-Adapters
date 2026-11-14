const { assetsAddresses, addressesUtxosAssetAll, getScriptsDatum } = require('../helper/chain/cardano/blockfrost')

const usdm_count_nft_asset = "e319d8e6629ff7991c8ae4f8aec2e0f10463ebdf29b57d26d34914f65553444d5f434f554e54"

async function tvl(api) {
  // The counter NFT moves when the script address changes, so look up where it lives now instead of hard-coding it
  const [{ address }] = await assetsAddresses(usdm_count_nft_asset)
  const [utxo] = await addressesUtxosAssetAll(address, usdm_count_nft_asset)
  const datum = await getScriptsDatum(utxo.data_hash)
  const total_value_locked = datum.json_value.fields[0].int / 1_000_000
  api.addUSDValue(total_value_locked)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Gets the total circulating supply of USDM from the datum of the USDM counter UTxO.",
  cardano: {
    tvl
  }
}
