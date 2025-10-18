const { sumTokens2 } = require("../helper/unwrapLPs");

const pools = [
  "0x18bad16195276c998e7c4637857532730c651d76", // St0G/0G
  "0x224d0891d63ca83e6dd98b4653c27034503a5e76", // Pai/0G
  "0xa9e824eddb9677fb2189ab9c439238a83695c091", // 0G/USDCe
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
  methodology: "TVL counts the tokens locked in Jaine's main liquidity pools on 0G Chain.",
  "0g": {
    tvl,
  },
};
