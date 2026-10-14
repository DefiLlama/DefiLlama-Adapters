// The LifeDAO - BTC-ETH Vault (Arbitrum)
// Users deposit into the IFVault, which forwards funds to
// IFStrategyAggregator -> IFBtcEthStrategy.
// We read totalAssets() from the vault only, which already includes
// funds deployed to the strategies, so nothing is double counted.

const VAULT = "0x86565284b9e6c29da4c401b3C59128F8672C216D";

async function tvl(api) {
  const asset = await api.call({ target: VAULT, abi: "address:asset" });
  const totalAssets = await api.call({ target: VAULT, abi: "uint256:totalAssets" });
  api.add(asset, totalAssets);
}

module.exports = {
  methodology:
    "TVL is the total assets reported by The LifeDAO BTC-ETH Vault on Arbitrum, including funds deployed through its strategy aggregator to the BTC-ETH strategy.",
  arbitrum: {
    tvl,
  },
};
