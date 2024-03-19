const contracts = {
    optimism: {
        vaults: [
            // usdc
            '0x034A4072E63aB05aF057e4E9aFC961EA584fB886', // entry
            '0xcf038417eac3bEa4be8f296B0Ed994e8410B6eBC', // polygon satellite
            '0x81C3b05753A40f7dd93F154eDC4112AF2F3B5B3b', // arbitrum satellite
            '0x5135Bd97b41871fC2745FEf24F941D9527B0b450',
            '0xD2FBB4Ee4b446766318A1766EA5bF38cAd4E3eEe',
            '0xA3c965A249855bff48925E4414A4b7f0920fbfe4',
        ],
    },
    polygon: {
        vaults: [
            '0xFABea2117d95b780077ca8dDf268BcC8c29589ED', // entry
            '0x98266478600d4Cae5082d2A185cc6533684dA108', // arbitrum satellite
            '0x4a307418cEd78A3f2348FD84e66453Efe0BDD16a', // optimisim satellite
            '0x3829d380bc9de2d1d421551f2D45FD81b3e82453',
            '0x9212728C3602A811927eFCa7a7628e88458D6525',
            '0x976d4B0368aB11b1c2677Dc7e71DA3640206a28d',
        ],
    },
    arbitrum: {
        vaults: [
            // usdc
            '0x98fCBbfb97B61e2DA167A69345c58e4126A5167B', // entry
            '0x801E78C94d5fffDD6F37684ad5ac68EF3b15E559', // polygon satellite
            '0x680924B3B81d918B01D43E80C092CF75C6063681', // optimisim satellite
            '0xe45011d955C17c00880300b20cF83Ca297aC8BC9',
            '0x691E1f8d698b6156EcdD0064B2e61d4a87aa041b',
            '0x867Ca248B3AB3dDF968304046b6346E3dD7aC5d2',
        ],
    },
}

module.exports = {
    contracts,
}