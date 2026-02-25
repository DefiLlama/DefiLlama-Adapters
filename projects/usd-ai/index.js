// USDai token addresses per chain
const USDai = {
  arbitrum: "0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF",
  plasma: "0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF",
};

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL is the total supply of USDai across all chains. USDai is a yield-bearing stablecoin backed by real-world GPU compute infrastructure financing. sUSDai (the staked version) is backed 1:1 by USDai locked in the staking contract, so it is included in the USDai total supply.",
};

const tvl = async (api) => {
  const token = USDai[api.chain];
  if (!token) throw new Error(`Unsupported chain in projects/usd-ai: ${api.chain}`);

  const supply = await api.call({
    target: token,
    abi: "erc20:totalSupply",
  });
  api.add(token, supply);
};

Object.keys(USDai).forEach((chain) => {
  module.exports[chain] = { tvl };
});
