const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = {
  bsc: "0xac653ce27e04c6ac565fd87f18128ad33ca03ba2",
  fantom: "0x991152411A7B5A14A8CF0cDDE8439435328070dF",
  metis: "0xAA1504c878B158906B78A471fD6bDbf328688aeB",
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: FACTORY.bsc,
      chain: 'bsc',
      coreAssets: [
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // wbnb
        '0xe9e7cea3dedca5984780bafc599bd69add087d56', // busd
        '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
        '0x55d398326f99059ff775485246999027b3197955', // USDT
        '0x2170ed0880ac9a755fd29b2688956bd959f933f8', // ETH
      ],
    }),
  },
  fantom: {
    tvl: getUniTVL({
      factory: FACTORY.fantom,
      chain: 'fantom',
      coreAssets: [
        '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // wftm
        '0x04068da6c83afcfa0e13ba15a6696662335d5b75', // USDC
        '0x049d68029688eabf473097a2fc38ef61633a3c7a', // USDT
        '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e', // DAI
      ],
    }),
  },
  metis: {
    tvl: getUniTVL({
      factory: FACTORY.metis,
      chain: 'metis',
      coreAssets: [
        '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000', // WMETIS
      ],
    }),
  },
}
