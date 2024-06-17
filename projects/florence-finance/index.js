const ETH_ARB_BRIDGE = "0xcee284f754e854890e311e3280b767f80797180d";
const ETH_FLR = "0x5e5d9aeec4a6b775a175b883dca61e4297c14ecb";
const ETH_EURS = "0xdb25f211ab05b1c97d595516f45794528a807ad8";

const ARB_FLR = "0x9b6226dd0191a77d032f56a6d383044ee99944c3";
const ARB_AGEUR = "0xfa5ed56a203466cbbc2430a43c66b9d8723528e7";

async function getTotalSupply(token, { api }) {
  const totalSupply = await api.call({
    abi: "function totalSupply() external view returns (uint256)",
    target: token,
  });
  return totalSupply;
}

async function getBorrowedOnEthereum(api) {
  const [flrSupply, flrInBridgeCustody] = await Promise.all([getTotalSupply(ETH_FLR, { api }), await api.call({
    abi: "function balanceOf(address account) view returns (uint256)",
    target: ETH_FLR,
    params: [ETH_ARB_BRIDGE],
  })]);

  const borrowed = flrSupply - flrInBridgeCustody; //Subtract FLR in bridge custody to avoid double counting accross chains

  api.add(ETH_EURS, borrowed / 1e16); //18 decimals (FLR) -> 2 decimals (EURS)
}

async function getBorrowedOnArbitrum(api) {
  const borrowed = await getTotalSupply(ARB_FLR, { api }); //FLR that are bridged to Ethereum are burned by the Arbitrum bridge. So there is no need to subtract here.
  api.add(ARB_AGEUR, borrowed); //Decimals of FLR and agEUR are both 18. No conversion needed.
}

module.exports = {
  methodology:
    "The Florin token (FLR) is minted whenever a new loan is funded and burned when a loan matures and is repaid. Since the Florin token is 1:1 redeemable for EUR the borrowed amount is denominated in the protocols treasuries EUR stablecoin of the respective chain. Consequently the total supply of Florin equals the amount borrowed through the protocol. To avoid double counting, the amount of FLR held in the bridge contract is subtracted from the total supply. ",
  ethereum: { start: 16077400, borrowed: getBorrowedOnEthereum, tvl: () => ({}) },
  arbitrum: { start: 126183369, borrowed: getBorrowedOnArbitrum, tvl: () => ({}) },
};