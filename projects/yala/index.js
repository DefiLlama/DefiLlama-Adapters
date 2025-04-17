async function tvl_ethereum(api) {
  const YBTC = "";
  const amt = await api.call({
    abi: "erc20:totalSupply",
    target: YBTC,
  });

  api.addCGToken("bitcoin", amt / 1e18);
}

async function borrowed_ethereum(api) {
  const YU = "";
  const amt = await api.call({
    abi: "erc20:totalSupply",
    target: YU,
  });

  api.addCGToken("usd", amt / 1e18);
}

module.exports = {
  methodology:
    "The total supply of Bridged YBTC is the Bitcoin locked in Yala Protocol",
  start: 0,
  ethereum: {
    tvl: tvl_ethereum,
    borrowed: borrowed_ethereum,
  },
};
