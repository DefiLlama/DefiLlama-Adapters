async function tvl(api) {
  const YBTC = "0x27A70B9F8073efE5A02998D5Cc64aCdc9e0Ba589";
  const amt = await api.call({
    abi: "erc20:totalSupply",
    target: YBTC,
  });

  api.addCGToken("bitcoin", amt / 1e18);
}

async function borrowed(api) {
  const YU = "0xE868084cf08F3c3db11f4B73a95473762d9463f7";
  const amt = await api.call({
    abi: "erc20:totalSupply",
    target: YU,
  });

  api.addCGToken("usd", amt / 1e18);
}

module.exports = {
  methodology:
    "The Yala Protocol allows users to lock Bitcoin as collateral to mint YU stablecoins. TVL is calculated by tracking the total supply of YBTC tokens (0x27A70B9F8073efE5A02998D5Cc64aCdc9e0Ba589), which represents Bitcoin locked in the protocol. The borrowed/stablecoin metric tracks the total supply of YU tokens (0xE868084cf08F3c3db11f4B73a95473762d9463f7), which represents the USD-pegged stablecoins minted against the Bitcoin collateral. Both token supplies are converted to their respective underlying asset values using CoinGecko price feeds.",
  start: 22344930,
  ethereum: {
    tvl,
    borrowed,
  },
};
