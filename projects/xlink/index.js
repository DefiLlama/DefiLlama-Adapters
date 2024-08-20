const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json');
const {getTotalSupply} = require("./helper");

module.exports = {
    methodology: "TVL of XLink is the sum of the tokens locked in its contracts",
    timetravel: false,
};

const config = {
    bitcoin: {
        owners:
            [
                'bc1qh604n2zey83dnlwt4p0m8j4rvetyersm0p6fts',
                '31wQsi1uV8h7mL3QvBXQ3gzkH9zXNTp5cF',
                'bc1q9hs56nskqsxmgend4w0823lmef33sux6p8rzlp',
                '32jbimS6dwSEebMb5RyjGxcmRoZEC5rFrS',
                'bc1qlhkfxlzzzcc25z95v7c0v7svlp5exegxn0tf58',
                '3MJ8mbu4sNseNeCprG85emwgG9G9SCort7',
                'bc1qeph95q50cq6y66elk3zzp48s9eg66g47cptpft',
                'bc1qfcwjrdjk3agmg50n4c7t4ew2kjqqxc09qgvu7d',
                '1882c4wfo2CzNo4Y4LCqxKGQvz7BsE7nqJ',
                '1KGnLjKyqiGSdTNH9s6okFk2t5J7R6CdWt',
            ],
    },
    bsc: {
        owners:
            [
                '0xFFda60ed91039Dd4dE20492934bC163e0F61e7f5',
                // '0x5caeb9d58325044a1ad9d4abff2e0d525928812d' // is EOA
            ],
        tokens:
            [
                ADDRESSES.bsc.USDT,
                ADDRESSES.bsc.BTCB
            ]
    },
    ethereum: {
        owners:
            [
                '0x13b72A19e221275D3d18ed4D9235F8F859626673',
                // '0x1bf78679b001c5efa20d80600e085ae52d25abc1' // is EOA
            ],
        tokens:
            [
                ADDRESSES.ethereum.USDT,
                ADDRESSES.ethereum.WBTC
            ]
    },
}

Object.keys(config).forEach(chain => {
    module.exports[chain] = {
        tvl: sumTokensExport(config[chain])
    }
})
module.exports.stacks = {
    tvl: async(api)=>{
        const tokens =  [ADDRESSES.stacks.USDT,ADDRESSES.stacks.ABTC]
        for (const token of tokens){
            const balance =await getTotalSupply(token,8)
            api.add(token, balance)
        }
    }
}
