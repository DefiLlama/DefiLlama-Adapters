const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unwrapLPs");
const { aaveExports, methodology, } = require("../helper/aave");

module.exports = {
  hallmarks: [
    [1704178500,"flash loan exploit"]
  ],
  methodology,
  arbitrum: {
    ...aaveExports('arbitrum', '0x9D36DCe6c66E3c206526f5D7B3308fFF16c1aa5E'),
    // balancer pool is not unwrapped properly, so we use staking and rely on price api instead
    pool2: staking("0x76ba3eC5f5adBf1C58c91e86502232317EeA72dE", "0x32df62dc3aed2cd6224193052ce665dc18165841"),
  },
  bsc: {
    ...aaveExports('bsc', '0x16Cd518fE9db541feA810b3091fBee6829a9B0Ce'),
    // balancer pool is not unwrapped properly, so we use staking and rely on price api instead
    pool2: sumTokensExport({ owner: '0x4fd9f7c5ca0829a656561486bada018505dfcb5e', tokens: ['0x346575fc7f07e6994d76199e41d13dc1575322e1'], useDefaultCoreAssets: true, })
  },
  ethereum: {
    ...aaveExports('ethereum', '0xe969066F2cCcE3145f62f669F151c6D566068BA2'),
    // balancer pool is not unwrapped properly, so we use staking and rely on price api instead
    pool2: staking("0x28e395a54a64284dba39652921cd99924f4e3797", "0xcF7b51ce5755513d4bE016b0e28D6EDEffa1d52a")
  },
  base: {
    ...aaveExports('base', '0x3eAF348Cf1fEC09C0f8d4f52AD3B8D894206b724'),
    // balancer pool is not unwrapped properly, so we use staking and rely on price api instead
    pool2: staking("0xD87F8a52a91680c993ece968B281bf92505A3741", "0x8a76639fe8e390ed16ea88f87beb46d6a5328254")
  },
};

const config = {
  bsc: {aTokens: [
    '0x34d4F4459c1b529BEbE1c426F1e584151BE2C1e5',
    '0x4Ff2DD7c6435789E0BB56B0553142Ad00878a004',
    '0x89d763e8532D256a3e3e60c1C218Ac71E71cF664',
    '0x3bDCEf9e656fD9D03eA98605946b4fbF362C342b',
    '0x455a281D508B4e34d55b31AC2e4579BD9b77cA8E',
    '0x58b0BB56CFDfc5192989461dD43568bcfB2797Db',
    '0x6350e53461c7C95964D699cfa4e84cec993eebb1'
  ] , tokens: [
    '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    '0x55d398326f99059fF775485246999027B3197955',
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    '0xa2E3356610840701BDf5611a53974510Ae27E2e1'
  ]},
  arbitrum: {aTokens: [
    '0x727354712BDFcd8596a3852Fd2065b3C34F4F770',
    '0xd69D402D1bDB9A2b8c3d88D98b9CEaf9e4Cd72d9',
    '0x48a29E756CC1C097388f3B2f3b570ED270423b3d',
    '0x0D914606f3424804FA1BbBE56CCC3416733acEC6',
    '0x0dF5dfd95966753f01cb80E76dc20EA958238C46',
    '0x42C248D137512907048021B30d9dA17f48B5b7B2',
    '0x2dADe5b7df9DA3a7e1c9748d169Cd6dFf77e3d01',
    '0x3a2d44e354f2d88EF6DA7A5A4646fd70182A7F55',
    '0xb11A56DA177c5532D5E29cC8363d145bD0822c81',
    '0x876F38f474e48A104c4af4F06cA488099C436C93',
    '0xd15a6568Dc891Fd04Aa2f64aF56C66C2bede59d6',
    '0x19f0bE6a603967c72bE32a30915a38d52cA31Ae2'
  ] , tokens: [
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    '0x5979D7b546E38E414F7E9822514be443A4800529',
    '0x912CE59144191C1204E64559FE8253a0e49E6548',
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    '0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe',
    '0x47c031236e19d024b42f8AE6780E44A573170703',
    '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336',
    '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34'
  ]},
}

Object.keys(config).forEach(chain => {
  const {aTokens, tokens,} = config[chain]
  module.exports[chain].tvl = sumTokensExport({ tokensAndOwners2: [tokens, aTokens], })
  module.exports[chain].borrowed = () => ({})
})