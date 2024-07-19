const { staking, stakingPricedLP } = require("../helper/staking");
const { graphQuery } = require("../helper/http");
const { getCurrentBlock } = require("../helper/chain/hbar");
const { getUniTVL } = require('../helper/unknownTokens')
const { toUSDTBalances } = require('../helper/balances')

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
    tvl: async () => {
      // const block = await getCurrentBlock()
      // pangolinFactory(id: "1" block: { number: ${block - 1000} }) {
      const data = await graphQuery('https://graph-hedera-pangolin.canary.exchange/subgraphs/name/pangolin', `{
          pangolinFactory(id: "1") {
          totalLiquidityUSD
          }
      }`)
      return toUSDTBalances(data.pangolinFactory.totalLiquidityUSD)
    }
  },
  start: 1612715300, // 7th-Feb-2021
};
