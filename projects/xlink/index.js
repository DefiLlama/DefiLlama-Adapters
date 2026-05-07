const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json');
const { getTotalSupply } = require("./helper");

module.exports = {
    methodology: "TVL of Brotocol is the sum of the tokens locked in its contracts",
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
                '0x4306374f07382b36AAe832A50831C8C5b26Cd41e',
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
                '0x65dFacfD08AfDD1CC02Caf3DE411661603394090',
                // '0x1bf78679b001c5efa20d80600e085ae52d25abc1' // is EOA
            ],
        tokens:
            [
                ADDRESSES.ethereum.USDT,
                ADDRESSES.ethereum.WBTC
            ]
    },
    core:{
        owners: [
            '0x0F38ED043A1A2ec79B15d7F4FB8D25036680ce03',
            '0x5Fd881623939e0a6Cd042478e88F9312E616a4c6',
        ],
        tokens:[
            '0xe80e0C533D41343b0038a3eA74102B4b9fF13e7e', //susdt
            '0x70727228DB8C7491bF0aD42C180dbf8D95B257e2'  //wbtc
        ]
    },
    bsquared:{
        owners:[
            '0x10eeCCc43172458F0ff9Cc3E9730aB256fAEE32e',
            '0x88af5f4bDd601c1bd3674bF1aD2CC282a720D66C',
        ],
        tokens:[
            '0x0CA7f9247932307c5e4b9Ffed88Ddc057DfAAaCC', //susdt
            '0x7A087e75807F2E5143C161a817E64dF6dC5EAFe0', //wbtc
        ]
    },
    bob:{
        owners:[
            '0x88af5f4bDd601c1bd3674bF1aD2CC282a720D66C',
            '0x916E5DFdf66FDd9Df738C63159D5F01268eD21Cb',
        ],
        tokens:[
            '0xf4A6170E827Ba17be9a3423b8662Cc82Eb273730', //susdt
            '0x7A087e75807F2E5143C161a817E64dF6dC5EAFe0', //wbtc
        ]
    },
    merlin:{
        owners:[
            '0x88af5f4bDd601c1bd3674bF1aD2CC282a720D66C',
            '0xF162b6467Eaf066A513a4B9235009d60c1faCf44',
        ],
        tokens:[
            '0xC13A12E657E0e7C6DAd9dd26B86A927b05edCaCB', //susdt
            '0x858d1dbd14a023A905535823a77925082507D38B', //wbtc
        ]
    },
    ailayer:{
        owners:[
            '0x88af5f4bDd601c1bd3674bF1aD2CC282a720D66C',
            '0xF162b6467Eaf066A513a4B9235009d60c1faCf44'
        ],
        tokens:[
            '0x7A087e75807F2E5143C161a817E64dF6dC5EAFe0', //susdt
            '0xA831a4E181F25D3B35949E582Ff27Cc44e703F37', //wbtc
        ]
    },
    mode:{
        owners:[
            '0x88af5f4bDd601c1bd3674bF1aD2CC282a720D66C',
            '0xF162b6467Eaf066A513a4B9235009d60c1faCf44'
        ],
        tokens:[
            '0xA831a4E181F25D3B35949E582Ff27Cc44e703F37', //susdt
            '0x7A087e75807F2E5143C161a817E64dF6dC5EAFe0' //wbtc
        ]
    },
    xlayer:{
        owners:[
            '0x88af5f4bDd601c1bd3674bF1aD2CC282a720D66C',
            '0xF162b6467Eaf066A513a4B9235009d60c1faCf44'
        ],
        tokens:[
            '0xA831a4E181F25D3B35949E582Ff27Cc44e703F37', //susdt
            '0x7A087e75807F2E5143C161a817E64dF6dC5EAFe0' //wbtc
        ]
    }
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