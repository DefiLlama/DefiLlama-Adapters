// 3F — leveraged vaults for tokenized RWAs (Centrifuge JAAA, Superstate USCC).
// Collateral deposited into the protocol is held as a wrapped token, which
// DefiLlama already prices. TVL is the on-chain totalSupply of each wrapped
// token. Add new assets here as more leveraged vaults launch.
const WRAPPED_ASSETS = [
  { symbol: "wJAAA", address: "0x86b495e4Cb00AB18Ad94BFD7920479cC79E8eBFE" },
  { symbol: "wUSCC", address: "0xF458Ad24B1dE7c653e8471efB0b87710b316b7D9" },
  { symbol: "wFalconX", address: "0x4614F7A56A3Eb83b2Ff9fA4B4b9575B28Fb68644" },
];

async function tvl(api) {
  const addresses = WRAPPED_ASSETS.map((a) => a.address);
  const supplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: addresses,
  });
  api.add(addresses, supplies);
}

module.exports = {
  misrepresentedTokens: false,
  methodology:
    "TVL is the total value of collateral wrapped by 3F Labs leveraged vaults, measured as the on-chain totalSupply of each wrapped token (wJAAA, wUSCC).",
  ethereum: {
    tvl,
  },
};
