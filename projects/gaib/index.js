// AID token address — same on all chains (LayerZero OFT + CREATE2)
const AID = "0x18F52B3fb465118731d9e0d276d4Eb3599D57596";

async function tvl(api) {
  const supply = await api.call({ abi: "erc20:totalSupply", target: AID });
  // Price AID via ethereum mapping so non-ethereum chain balances are valued too.
  api.add(`ethereum:${AID}`, supply, { skipChain: true });
}

module.exports = {
  methodology:
    "TVL is the total supply of AID (AI Dollar) across all deployed chains. AID is a synthetic dollar backed 1:1 by US Treasuries and stablecoins.",
  misrepresentedTokens: true,
  timetravel: true,
  start: 1730419200,
  ethereum: { tvl },
  arbitrum: { tvl },
  base: { tvl },
  bsc: { tvl },
  sei: { tvl: () => ({}) },
  sty: { tvl: () => ({}) },
  hallmarks: [
    ["2024-11-01", "AID & sAID mainnet launch"],
  ],
};
