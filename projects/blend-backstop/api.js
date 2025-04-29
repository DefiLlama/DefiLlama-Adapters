const { BackstopConfig, BackstopToken } = require("@blend-capital/blend-sdk");

const BACKSTOP_ID = "CAO3AGAMZVRMHITL36EJ2VZQWKYRPWMQAPDQD5YEOF3GIF7T44U4JAL3";

const network = {
  rpc: "https://soroban-rpc.creit.tech/",
  passphrase: "Public Global Stellar Network ; September 2015",
};

async function tvl(api) {
  let backstop = await BackstopConfig.load(network, BACKSTOP_ID);
  let backstop_token = await BackstopToken.load(
    network,
    backstop.backstopTkn,
    backstop.blndTkn,
    backstop.usdcTkn
  );

  // backstop token is a 80% BLND 20% USDC Comet pool (Balancer v1 fork)
  api.addCGToken("usd-coin", Number(backstop_token.usdc) / 1e7);
  api.addCGToken('blend', Number(backstop_token.blnd) / 1e7);
  return api.getBalances();
}

module.exports = {
  hallmarks: [
    [1745478927, "Calculate TVL using BLND Coin Gecko price instead of approximation via pool weights"],
  ],
  stellar: {
    tvl: () => ({}),
    pool2: tvl
  },
};
