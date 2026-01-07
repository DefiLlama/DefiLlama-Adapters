


const config = {
    ethereum: {
        vaultCore: [
            '0x173AE6283A717b6cdD5491EAc5F82C082A8c674b', //PAR
            '0xE26348D30694aa7E879b9335252362Df3df93204', //paUSD
          ],
        parallelizer:{
            address: "0x6efeDDF9269c3683Ba516cb0e2124FE335F262a2",
            fromBlock: 22676220,
        },
    },
    polygon:{
        vaultCore: [
            '0x0a9202C6417A7B6B166e7F7fE2719b09261b400f', //PAR
            '0xcABAbC1Feb7C5298F69B635099D75975aD5E6e5f', //paUSD
        ],
    },
    fantom:{
        vaultCore: [
            '0xF6aBf8a89b3dA7C254bb3207e2eBA9810bc51f58', //PAR
        ],
    },
    base: {
        parallelizer:{
            address: "0xC3BEF21Ea7dEB5C34CF33E918c8e28972C8048eD",
            fromBlock: 31808846,
        },
    },
    sonic: {
        parallelizer:{
            address: "0xBEFBAe2330186F031b469e26283aCc66bb5F8826",
            fromBlock: 34952978,
        },
    },
    hyperliquid: {
        parallelizer:{
            address: "0x1250304F66404cd153fA39388DDCDAec7E0f1707",
            fromBlock: 5117819,
        },
    },
}

module.exports = {
    config
}