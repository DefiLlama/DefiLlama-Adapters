const sdk = require("@defillama/sdk")
const { function_view, timestampToVersion } = require("../helper/chain/aptos")

const EVM_FIABTC = {
  ethereum: "0x22F0E0a4c97ff43546dad16d43Ef854C773F0e08",
  sei: "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  core: "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  arbitrum: "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  base: "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  polygon: "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  unichain: "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
  plume_mainnet: "0x60C230c38aF6d86b0277a98a1CAeAA345a7B061F",
}

const APTOS_FIABTC = "0x75de592a7e62e6224d13763c392190fda8635ebb79c798a5e9dd0840102f3f93"

const tvl = async (api) => {
  const supplies = await Promise.all(
    Object.entries(EVM_FIABTC).map(([chain, target]) =>
      new sdk.ChainApi({ chain, timestamp: api.timestamp }).call({ abi: "erc20:totalSupply", target })
    )
  )
  let totalBtc = supplies.reduce((sum, supply) => sum + supply / 1e8, 0)

  const isHistorical = api.timestamp && Date.now() / 1000 - api.timestamp > 2 * 3600
  let aptosAmount = 0
  try {
    const aptosSupply = await function_view({
      functionStr: "0x1::fungible_asset::supply",
      type_arguments: ["0x1::fungible_asset::Metadata"],
      args: [APTOS_FIABTC],
      ledgerVersion: isHistorical ? await timestampToVersion(new Date(api.timestamp * 1000)) : undefined,
    })
    aptosAmount = aptosSupply && aptosSupply.vec && aptosSupply.vec.length ? Number(aptosSupply.vec[0]) : 0
  } catch (e) {
    if (!isHistorical) throw e
  }
  totalBtc += aptosAmount / 1e8

  api.addCGToken("bitcoin", totalBtc)
}

module.exports = {
  methodology:
    "TVL is the total FIABTC minted across all destination chains, which is 1:1 backed by BTC locked in the Fiamma BitVM2 bridge. The minted supply is read on-chain because the bridge's TVL API is offline.",
  bitcoin: {
    tvl,
  },
}