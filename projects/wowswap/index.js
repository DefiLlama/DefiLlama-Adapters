const BigNumber = require("bignumber.js");
const protocol = require("./protocol");

function tvl(chain) {
  return async function(timestamp, block, chainBlocks) {
    const lendables = await protocol.getLendables(chain, chainBlocks[chain]);
    const tradables = await protocol.getTradables(chain, chainBlocks[chain]);
    const shortables = await protocol.getShortables(chain, chainBlocks[chain]);
    const proxyLendables = await protocol.getProxyLendables(chain, chainBlocks[chain]);

    const reserves = await protocol.getReserves([...lendables, ...shortables], chain, chainBlocks[chain]);
    const pairs = await protocol.getPairs(lendables, tradables, chain, chainBlocks[chain]);
    const routablePairs = await protocol.getRoutablePairs(lendables, proxyLendables, tradables, chain, chainBlocks[chain]);
    const shortingPairs = await protocol.getShortingPairs(lendables, shortables, chain, chainBlocks[chain]);
    const routableShortingPairs = await protocol.getRoutableShortingPairs(lendables, proxyLendables, shortables, chain, chainBlocks[chain]);

    const stakedLiquidity = Object.entries(await protocol.getStakedLiquidity(chain, chainBlocks[chain]))
    const liquidity = (await Promise.all([
        reserves,
        pairs,
        routablePairs,
        shortingPairs,
        routableShortingPairs
      ].flatMap(contracts => protocol.getLiquidity(contracts, chain, chainBlocks[chain])))
    ).flatMap(Object.entries);

    const balances = {};

    for (const [token, balance] of [...liquidity, ...stakedLiquidity]) {
      balances[token.toLowerCase()] = BigNumber.sum((balances[token.toLowerCase()] || 0).toString(), balance);
    }

    return Object.fromEntries(
      Object.entries(balances)
        .filter(([, value]) => value && String(value) !== "0")
        .map(([token, value]) => ([`${chain}:${token}`, value]))
    );
  };
}

module.exports = {
  start: 1618218000,            // Mon Apr 12 2021 09:00:00

  misrepresentedTokens: true,
  ethereum: { tvl: tvl("ethereum") },
  bsc: { tvl: tvl("bsc") },
  polygon: { tvl: tvl("polygon") },
  heco: { tvl: tvl("heco") },
  avax: { tvl: tvl("avax") },
  iotex: { tvl: tvl("iotex") },
  metis: { tvl: tvl("metis") }
};