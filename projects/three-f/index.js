// 3F — leveraged vaults for tokenized RWAs (Centrifuge JAAA, Superstate USCC, FalconX).
// Collateral deposited into the protocol is held as a strict 1:1 wrapped token
// (wJAAA / wUSCC / wFalconX), which DefiLlama prices directly. TVL is the
// on-chain totalSupply of each wrapped token.
const WRAPPED_ASSETS = [
  "0x86b495e4Cb00AB18Ad94BFD7920479cC79E8eBFE", // wJAAA
  "0xF458Ad24B1dE7c653e8471efB0b87710b316b7D9", // wUSCC
  "0x4614F7A56A3Eb83b2Ff9fA4B4b9575B28Fb68644", // wFalconX
];

async function tvl(api) {
  const supplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: WRAPPED_ASSETS,
    permitFailure: true,
  });
  WRAPPED_ASSETS.forEach((token, i) => {
    if (supplies[i] != null) api.add(token, supplies[i]);
  });
}

module.exports = {
  misrepresentedTokens: false,
  start: "2026-04-08",
  methodology:
    "TVL is the total value of collateral wrapped by 3F leveraged vaults, measured as the on-chain totalSupply of each wrapped token (wJAAA, wUSCC, wFalconX).",
  ethereum: {
    tvl,
  },
};
