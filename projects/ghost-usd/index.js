const { addressesUtxosAssetAll, getScriptsDatum } = require("../helper/chain/cardano/blockfrost");

const GHOST_USD_TREASURY_NFT_ASSET_ID = "69811cdebc2a94a986c19a69cc7434a102b474ca8eb14ce207940c42.7472656173757279"
const GHOST_USD_TREASURY_ADDRESS = "addr_test1wp5cz8x7hs4ff2vxcxdxnnr5xjss9dr5e28tzn8zq72qcssz6f02y"
const BLOCKFROST_PREVIEW_OPTIONS = { network: 'preview' }
const TREASURY_NFT_ASSET_ID_HEX = GHOST_USD_TREASURY_NFT_ASSET_ID.replace(".", "")

async function tvl(api) {
  const utxos = await addressesUtxosAssetAll(
    GHOST_USD_TREASURY_ADDRESS,
    TREASURY_NFT_ASSET_ID_HEX,
    BLOCKFROST_PREVIEW_OPTIONS,
  )
  if (!utxos.length) throw new Error("Treasury NFT UTxO not found on preview")

  const utxo = utxos[0]
  if (!utxo.data_hash) throw new Error("Treasury UTxO is missing a datum hash")

  const { json_value: datum } = await getScriptsDatum(utxo.data_hash, BLOCKFROST_PREVIEW_OPTIONS)
  const circulatingSupply = getCirculatingSupply(datum)

  // Supply is tracked in 6 decimal places, so convert to whole tokens before adding USD value
  api.addUSDValue(Number(circulatingSupply) / 1e6)
}

function getCirculatingSupply(datum) {
  if (!datum || datum.constructor !== 0 || !Array.isArray(datum.fields))
    throw new Error("Unexpected inline datum format for treasury UTxO")

  const [supplyField] = datum.fields
  const supply = supplyField?.int ?? supplyField
  if (supply === undefined) throw new Error("circulating_supply missing in datum")

  return BigInt(supply)
}

module.exports = {
  methodology: 'The TVL of GHOST USD is the amount of GHOST_USD in circulation as recorded by the smart contract on Cardano preview.',
  
  cardano: {
    tvl,
  },
};
