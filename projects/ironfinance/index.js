const sdk = require('@defillama/sdk');
const abiPolygon = require('./abi-polygon.json');

const Contracts = {
  polygon: {
    pools: {
      is3usd: '0x837503e8a8753ae17fb8c8151b8e6f586defcb57',
    }
  },
};

const poolTvl = async (poolAddress, block) => {
  const [balances, tokens] = await Promise.all([
    sdk.api.abi.call({
      target: poolAddress,
      abi: abiPolygon.IronSwap.getTokenBalances,
      chain: 'polygon',
      block,
    }),
    sdk.api.abi.call({
      target: poolAddress,
      abi: abiPolygon.IronSwap.getTokens,
      chain: 'polygon',
      block,
    }),
  ]);

  const sum = {}
  tokens.output.forEach((token, i) => {
    sdk.util.sumSingleBalance(sum, `polygon:${token}`, balances.output[i]);
  })

  return sum
};

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const tvl = {}

  for (let address of Object.values(Contracts.polygon.pools)) {
    const balances = await poolTvl(address, chainBlocks['ploygon'])

    Object.entries(balances).forEach(([token, value]) => {
      sdk.util.sumSingleBalance(tvl, token, value)
    })
  }
  return tvl
};

module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([polygonTvl]),
};
