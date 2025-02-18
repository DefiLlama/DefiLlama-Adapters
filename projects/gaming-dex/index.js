const BigNumber = require("bignumber.js");
const { onChainTvl } = require('../helper/balancer')
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');

const WOAS = '0x5200000000000000000000000000000000000001';
const stOAS = '0x804c0ab078e4810edbec24a4ffb35ceb3e5bd61b';

const ABI = {
  stOas: {
    balanceOf: "function balanceOf(address owner) external view override returns (uint256)",
    estimateOAS: "function estimateStOAS( uint256 amount) external view override returns (uint256)"
  }
}

function onChainTvlOas(vault, fromBlock, { blacklistedTokens = [], preLogTokens = [], onlyUseExistingCache, permitFailure } = {}) {
  return async (api) => {
    const logs = await getLogs({
      api,
      target: vault,
      topics: ['0x3c13bc30b8e878c53fd2a36b679409c073afd75950be43d8858768e956fbc20e'],
      fromBlock,
      eventAbi: 'event PoolRegistered(bytes32 indexed poolId, address indexed poolAddress, uint8 specialization)',
      onlyArgs: true,
      extraKey: 'PoolRegistered',
      onlyUseExistingCache,
    })
    const logs2 = await getLogs({
      api,
      target: vault,
      topics: ['0xf5847d3f2197b16cdcd2098ec95d0905cd1abdaf415f07bb7cef2bba8ac5dec4'],
      fromBlock,
      eventAbi: 'event TokensRegistered(bytes32 indexed poolId, address[] tokens, address[] assetManagers)',
      onlyArgs: true,
      extraKey: 'TokensRegistered',
      onlyUseExistingCache,
    })

    const tokens = logs2.map(i => i.tokens).flat()
    tokens.push(...preLogTokens)
    const pools = logs.map(i => i.poolAddress)
    blacklistedTokens = [...blacklistedTokens, ...pools]

    // Convert stOAS to OAS
    const stOasBalance = await api.call({ abi: ABI.stOas.balanceOf, target: stOAS, params: [vault] });
    const oasEstimate = await api.call({ abi: ABI.stOas.estimateOAS, target: stOAS, params: [stOasBalance] });
    const sumTokenBalances = await sumTokens2({ api, owner: vault, tokens, blacklistedTokens, permitFailure })
    sumTokenBalances[`${api.chain}:${WOAS}`] = BigNumber(sumTokenBalances[`${api.chain}:${WOAS}`]).plus(oasEstimate).toFixed(0);

    return sumTokenBalances;
  }
}


module.exports = {
  defiverse: {
    tvl: onChainTvl('0x2FA699664752B34E90A414A42D62D7A8b2702B85', 87620),
  },
  oas: {
    tvl: onChainTvlOas('0xfb6f8FEdE0Cb63674Ab964affB93D65a4a7D55eA', 4522800, {
      blacklistedTokens: [stOAS]
    }),
  }
};
