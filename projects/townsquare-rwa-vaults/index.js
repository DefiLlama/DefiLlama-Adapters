const trwaUSD = {
    ethereum: "0x3FE52A92DC3F902D53b2139f95CedA8FeDfe1C18",
    base:"0x27B1E0FC9eeBFcA90d7BDe3958723fa0aB937CFA",
    xlayer:"0x1f5575b690bbb049FC50933A66F52eFA81904978",
    robinhood: "0x5B8dC679EDAE1Ad507c433EF55d5B4bA620F1919",
    ink:"0x1f5575b690bbb049FC50933A66F52eFA81904978",
    monad:"0x50AF964d81c18ed885dBf741cDc3366239a3cC10"
  };
  
  const trwaUSDi = {
    ethereum: "0xF2ADf2Bc428284ad59376b836b7f27eaA8Ac44ed",
    base: "0xFbB5e8B7109252FA1d2B208a96Dfd508BFAb023C",
    monad: "0x73F0c2ed71b5c750Cf4900220F901B732EA71Ff0",
    xlayer:"0xa7bE6b8F61C392F7e2483F8D2B6efd430EDaF098",
    robinhood:"0x1f5575b690bbb049FC50933A66F52eFA81904978",
    arbitrum:"0xa7bE6b8F61C392F7e2483F8D2B6efd430EDaF098",
    pharos:"0xa7bE6b8F61C392F7e2483F8D2B6efd430EDaF098"
    
  };
  
  const TOKENS = { trwaUSD, trwaUSDi };
  
  const abis = {
    totalSupply: "function totalSupply() view returns (uint256)",
  };
  
  async function tvl(api) {
    const tokens = Object.values(TOKENS)
      .map((chains) => chains[api.chain])
      .filter(Boolean);
    if (!tokens.length) return;
    const totalSupplies = await api.multiCall({ abi: abis.totalSupply, calls: tokens });
    api.addTokens(tokens, totalSupplies);
  }
  
  const chains = [
    ...new Set(Object.values(TOKENS).flatMap((chains) => Object.keys(chains))),
  ];
  
  module.exports = {
    methodology:
      "TVL is the total supply of the rwa vault tokens (trwaUSD, trwaUSDi).",
    misrepresentedTokens: true,
    ...Object.fromEntries(chains.map((chain) => [chain, { tvl }])),
  };
  