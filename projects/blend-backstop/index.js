const { BackstopConfig, BackstopToken } = require("@blend-capital/blend-sdk");

const BACKSTOP_ID = "CAO3AGAMZVRMHITL36EJ2VZQWKYRPWMQAPDQD5YEOF3GIF7T44U4JAL3";

const network = {
  rpc: "https://soroban-rpc.creit.tech/",
  passphrase: "Public Global Stellar Network ; September 2015",
};

async function tvl() {
  let balances = {};
  let backstop = await BackstopConfig.load(network, BACKSTOP_ID);
  let backstop_token = await BackstopToken.load(
    network,
    backstop.backstopTkn,
    backstop.blndTkn,
    backstop.usdcTkn
  );

  // backstop token is a 80% BLND 20% USDC Comet pool (Balancer v1 fork)
  // since BLND has no coingecko price, use USDC held in LP shares by the
  // backstop to approximate total USDC held
  balances["usd-coin"] = (Number(backstop_token.usdc) / 1e7) * 5;
  return balances;
}

module.exports = {
  timetravel: false,
  methodology: `Counts the total amount of BLND-USDC LP shares held by the Blend backstop contract. The shares are converted to a USDC value based on the liquidity pool weights.`,
  stellar: {
    tvl: tvl,
  },
};
