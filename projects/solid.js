module.exports = {
  name: "SOLID",
  url: "https://solid.online",
  description: "SOLID is an over-collateralized stablecoin protocol on Terra2 (Phoenix). Users can deposit LSTs and IBC assets to mint the stablecoin SOLID. Its governance token is CAPA.",
  chain: "Terra2",
  logo: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/solid.png",
  audits: [
    "https://github.com/SCV-Security/PublicReports/blob/main/CW/Capapult/Capapult%20-%20Money%20Market%20Contracts%20-%20Audit%20Report%20v1.0%20.pdf",
    "https://github.com/SCV-Security/PublicReports/blob/fa51bf944593bf18d128b4f812b3150b218f0d25/Capapult%2FCapapult%20Finance%20-%20Oracle%20Contract%20-%20Audit%20Report%20v1.0.pdf"
  ],
  gecko_id: ["capapult", "solid-2"],
  cmcId: null,
  github: ["solid-online"],
  methodology:
    "TVL = sum of custody balances for SOLID collaterals (ampLUNA, bLUNA, USDC, axl.WETH, axl.WBTC, wSOL, wBNB). Borrowed = outstanding SOLID supply."
}