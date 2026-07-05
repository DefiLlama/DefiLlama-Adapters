const sdk = require("@defillama/sdk")
const { function_view } = require("../helper/chain/aptos")

// Fiamma is a BitVM2 BTC bridge: BTC locked on Bitcoin mints FIABTC (8 decimals, 1:1)
// on the destination chains. The BTC is held in per-deposit BitVM2 taproot addresses
// that aren't enumerable, and the bridge's TVL API (bridge-api.fiammachain.io) is offline,
// so we measure the locked BTC from the minted FIABTC supply on each destination chain.
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
  let totalBtc = 0

  for (const [chain, target] of Object.entries(EVM_FIABTC)) {
    const supply = await new sdk.ChainApi({ chain }).call({ abi: "erc20:totalSupply", target })
    totalBtc += supply / 1e8
  }

  const aptosSupply = await function_view({
    functionStr: "0x1::fungible_asset::supply",
    type_arguments: ["0x1::fungible_asset::Metadata"],
    args: [APTOS_FIABTC],
  })
  totalBtc += Number(aptosSupply.vec[0]) / 1e8

  api.addCGToken("bitcoin", totalBtc)
}

module.exports = {
  methodology:
    "TVL is the total FIABTC minted across all destination chains, which is 1:1 backed by BTC locked in the Fiamma BitVM2 bridge. The minted supply is read on-chain because the bridge's TVL API is offline.",
  bitcoin: {
    tvl,
  },
}
