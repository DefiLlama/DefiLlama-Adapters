const ETH_ARB_BRIDGE = "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1";
const ETH_FLR = "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE";
const ETH_EURS = "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1";

const ARB_FLR = "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1";
const ARB_AGEUR = "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1";

const BASE_FLR = "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE";
const BASE_EURC = "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1";

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

async function getBorrowedOnBase(api) {
  const borrowed = await getTotalSupply(BASE_FLR, { api }); //FLR on Base are not multi-chain so there is no need to subtract anything yet.
  api.add(BASE_EURC, borrowed / 1e12); //12 decimals (FLR) -> 2 decimals (EURC)
}

module.exports = {
  methodology:
    "The Florin token (FLR) is minted whenever a new loan is funded and burned when a loan matures and is repaid. Since the Florin token is 1:1 redeemable for EUR the borrowed amount is denominated in the protocols treasuries EUR stablecoin of the respective chain. Consequently the total supply of Florin equals the amount borrowed through the protocol. To avoid double counting, the amount of FLR held in the bridge contract is subtracted from the total supply. ",
  ethereum: { borrowed: getBorrowedOnEthereum, tvl: () => ({}) },
  arbitrum: {  borrowed: getBorrowedOnArbitrum, tvl: () => ({}) },
  base: { borrowed: getBorrowedOnBase, tvl: () => ({}) },
};
