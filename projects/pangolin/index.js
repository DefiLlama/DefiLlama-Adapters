const { staking, stakingPricedLP } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')
const { cachedGraphQuery } = require("../helper/cache");
const { transformDexBalances } = require("../helper/portedTokens");

const contracts = {
  avax: {
    factory: "0xefa94DE7a4656D787667C749f7E1223D71E9FD88",
    png: "0x60781C2586D68229fde47564546784ab3fACA982",
    stakingContract: "0x88afdaE1a9F58Da3E68584421937E5F564A0135b",
  },
  songbird: {
    factory: "0xB66E62b25c42D55655a82F8ebf699f2266f329FB",
    png: "0xb2987753D1561570f726Aa373F48E77e27aa5FF4",
    stakingContract: "0x7428A089A79B24400a620F1Cbf8bd0526cFae777",
  },
  flare: {
    factory: "0xbfe13753156b9c6b2818FB45ff3D2392ea43d79A",
    png: "0xC60BcDaA9CC7Cc372E793101fDfCB1083E25A203",
  },
};

module.exports = {
  misrepresentedTokens: true,
  timetravel: false, // hedera rug
  methodology:
    "The Pangolin factory contract address are used to obtain the balance held in every LP pair and the stake contract is used to get the locked PNG balance.",
  avax: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.avax.factory, }),
    staking: staking(contracts.avax.stakingContract, contracts.avax.png),
  },
  songbird: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.songbird.factory, }),
    staking: stakingPricedLP(
      contracts.songbird.stakingContract,
      contracts.songbird.png,
      'songbird',
      '0xEd87F64065fdB4e4Ee580de1F768E2F8bD240A10',
      "songbird",
      false
    ),
  },
  flare: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.flare.factory, }),
  },
  hedera: {
    tvl: async (api) => {
      const { pairs } = await cachedGraphQuery('pangolin-v2/hedera', 'https://graph-hedera-pangolin.canary.exchange/subgraphs/name/pangolin', `{pairs(first: 1000) {
    id
    token0 { id}
    token1 { id }
  }}`)
  const calls = pairs.map(({ id}) => id)
  const reserves = await api.multiCall({ abi: 'function getReserves() view returns (uint112 token0Bal, uint112 token1Bal, uint32 blockTimestampLast)', calls })
  
    const data = reserves.map(({ token0Bal, token1Bal }, idx) => ({
        token0: pairs[idx].token0.id,
        token1: pairs[idx].token1.id,
        token0Bal,
        token1Bal,
    }))
    return transformDexBalances({ api, data })
    },
  },
  start: '2021-02-07', // 7th-Feb-2021
};
