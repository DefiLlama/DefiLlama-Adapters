const sdk = require("@defillama/sdk");

const abi = {
  getTokenset: "function getTokenset() view returns ((string chain, string symbol, string addr, uint8 decimals, uint256 amount, address custody)[])",
  totalSupply: "function totalSupply() view returns (uint256)",
  decimals: "function decimals() view returns (uint8)",
};

const ssi_tokens = [
  "0x9E6A46f294bB67c20F1D1E7AfB0bBEf614403B55", // MAG7.ssi
  "0x164ffdaE2fe3891714bc2968f1875ca4fA1079D0", // DEFI.ssi
  "0xdd3acDBDc7b358Df453a6CB6bCA56C92aA5743aA", // MEME.ssi
];

const CHAIN_MAP = {
  ETH: "ethereum",
  BSC_BNB: "bsc",
  SOL: "solana",
};

async function getTokensets() {
  const [tokensets, supplies, decimalsRes] = await Promise.all([
    sdk.api.abi.multiCall({ abi: abi.getTokenset, calls: ssi_tokens.map((t) => ({ target: t })), chain: "base" }),
    sdk.api.abi.multiCall({ abi: abi.totalSupply, calls: ssi_tokens.map((t) => ({ target: t })), chain: "base" }),
    sdk.api.abi.multiCall({ abi: abi.decimals, calls: ssi_tokens.map((t) => ({ target: t })), chain: "base" }),
  ]);
  return { tokensets, supplies, decimalsRes };
}

async function tvl(api) {
  const { tokensets, supplies, decimalsRes } = await getTokensets();

  tokensets.output.forEach(({ output: tokenset }, i) => {
    const supply = BigInt(supplies.output[i].output);
    const dec = parseInt(decimalsRes.output[i].output);

    tokenset.forEach((token) => {
      const chainLabel = CHAIN_MAP[token.chain];
      if (!chainLabel || chainLabel !== api.chain) return;
      if (!token.addr || token.addr === "") return;

      const totalAmount = (BigInt(token.amount) * supply) / (BigInt(10) ** BigInt(dec));
      if (totalAmount > 0n) api.add(token.addr, totalAmount.toString());
    });
  });
}

module.exports = {
  methodology:
    "TVL is calculated from each SSI token's getTokenset() composition multiplied by totalSupply. Because custody is off-contract, the adapter tracks only the ERC-20/SPL legs exposed by on-chain accounting; native-only BTC/DOGE positions are currently excluded because no token address is available to price them.",
  ethereum: { tvl },
  bsc: { tvl },
  solana: { tvl },
};
