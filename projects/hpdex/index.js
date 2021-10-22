const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0xE1d563BcFD4E2a5A9ce355CC8631421186521aAA) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    hpb: {
        tvl:calculateUsdUniTvl("0xE1d563BcFD4E2a5A9ce355CC8631421186521aAA", "hpb", "0xBE05Ac1FB417c9EA435b37a9Cecd39Bc70359d31", ["0xe78984541A634C52C760fbF97ca3f8E7d8f04C85","0x0F63352dF611350201c419dE9399a67e50D4B820","0x6383f770f1eec68e80ac0c5527be71a11b4d182c"], "high-performance-blockchain")
    }
}