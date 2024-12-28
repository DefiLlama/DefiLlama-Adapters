const { getUniTVL } = require('../helper/unknownTokens')
const { staking, stakings, stakingPricedLP } = require("../helper/staking.js");

const oracleFoundry = '0x5795377c85e0fdF6370fae1B74Fe03b930C4a892';
const oracleToken = '0xd7565b16b65376e2ddb6c71e7971c7185a7ff3ff';
const ORACLE_SGB_LP = '0x1987E504E70b9ACbAa4E042FDDE4ecB6CEaf5b77'

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xDcA8EfcDe7F6Cb36904ea204bb7FCC724889b55d) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  songbird: {
    tvl: getUniTVL({ factory: '0xDcA8EfcDe7F6Cb36904ea204bb7FCC724889b55d', useDefaultCoreAssets: true }),
    staking: stakingPricedLP(oracleFoundry, oracleToken, 'songbird', ORACLE_SGB_LP, 'songbird')
  },
}; // node test.js projects/oracleswap/index.js