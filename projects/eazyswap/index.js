const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const EAZY_TOKEN = "0x6cF99BAA0a4d079F960216d08cf9a1Bc7e4dd37C";
module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory address (0xbeE82c502eC48a962510Aa4505595259C3ba631f) is used to find the LP pairs. TVL is equal to the liquidity on the AMM. Staking balance is equal to the balance of $EAZY in $xEAZY contract",
    pulse: {
        tvl: getUniTVL({ factory: '0xbeE82c502eC48a962510Aa4505595259C3ba631f', useDefaultCoreAssets: true }),
        staking: sumTokensExport({
            owners: ['0x23E1Be43887641E8c0EB9938FaB9D6539438115a'],
            tokens: [EAZY_TOKEN],
        })
    }
};


