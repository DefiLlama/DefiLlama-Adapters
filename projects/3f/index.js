// 3F — leveraged vaults for tokenized RWAs (Centrifuge JAAA, Superstate USCC, FalconX).
// Collateral deposited into the protocol is held as a wrapped token
// TVL is the on-chain totalSupply of each wrapped token.
// Add new assets here as more leveraged vaults launch.

const WRAPPED_ASSETS = [
  "0x86b495e4Cb00AB18Ad94BFD7920479cC79E8eBFE", // wJAAA
  "0xF458Ad24B1dE7c653e8471efB0b87710b316b7D9", // wUSCC
  "0x4614F7A56A3Eb83b2Ff9fA4B4b9575B28Fb68644", // wFalconX
];

async function tvl(api) {
  const supplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: WRAPPED_ASSETS,
  });
  api.add(WRAPPED_ASSETS, supplies);
}

module.exports = {
  misrepresentedTokens: false,
  methodology:
    "TVL is the total value of collateral wrapped by 3F leveraged vaults, measured as the on-chain totalSupply of each wrapped token (wJAAA, wUSCC, wFalconX).",
  ethereum: {
    tvl,
  },
};
