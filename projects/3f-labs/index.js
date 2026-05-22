// 3F Labs — leveraged vaults for tokenized RWAs (Centrifuge JAAA, Superstate USCC).
// Collateral deposited into the protocol is held as a 1:1 wrapped token
// (wJAAA / wUSCC). TVL is the on-chain totalSupply of each wrapped token,
// valued at its underlying RWA token which DefiLlama already prices.
const WRAPPED_ASSETS = [
  {
    // wJAAA -> JAAA (Janus Henderson Anemoy AAA CLO, via Centrifuge)
    wrapped: "0x86b495e4Cb00AB18Ad94BFD7920479cC79E8eBFE",
    underlying: "0x5a0f93d040de44e78f251b03c43be9cf317dcf64",
  },
  {
    // wUSCC -> USCC (Superstate)
    wrapped: "0xF458Ad24B1dE7c653e8471efB0b87710b316b7D9",
    underlying: "0x14d60E7FDC0D71d8611742720E4C50E7a974020c",
  },
];

async function tvl(api) {
  const supplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: WRAPPED_ASSETS.map((a) => a.wrapped),
  });
  WRAPPED_ASSETS.forEach((a, i) => {
    api.add(a.underlying, supplies[i]);
  });
}

module.exports = {
  misrepresentedTokens: false,
  methodology:
    "TVL is the total value of collateral wrapped by 3F Labs leveraged vaults, measured as the on-chain totalSupply of each wrapped token (wJAAA, wUSCC) valued 1:1 at its underlying RWA token (JAAA, USCC).",
  ethereum: {
    tvl,
  },
};
