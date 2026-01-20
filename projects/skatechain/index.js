const { sumTokens2 } = require("../helper/unwrapLPs");

const pools = [
  "0x616b894eDf62369C0ab1a586DB90cf47f76708DB", // 0G/USDC
  "0xC2bE4b8852E37ECf979b3E2b5d58162719303804", // st0G/0G
];

async function tvl(api) {
  const token0Calls = pools.map(pool => ({ target: pool }));
  const token1Calls = pools.map(pool => ({ target: pool }));

  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: token0Calls }),
    api.multiCall({ abi: 'address:token1', calls: token1Calls }),
  ]);

  const ownerTokens = pools.map((pool, i) => [[token0s[i], token1s[i]], pool]);

  return sumTokens2({ api, ownerTokens });
}

module.exports = {
  methodology: "TVL counts the tokens locked in Skatechain's liquidity pools on 0G Chain.",
  "0g": {
    tvl,
  },
};
