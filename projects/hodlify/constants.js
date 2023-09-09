const contracts = {
    optimism: {
        vaults: [
            '0x034A4072E63aB05aF057e4E9aFC961EA584fB886', // entry
            '0xcf038417eac3bEa4be8f296B0Ed994e8410B6eBC', // polygon satellite
            '0x81C3b05753A40f7dd93F154eDC4112AF2F3B5B3b', // arbitrum satellite
        ],
        strategies: [
            '0xe6ab63FbDFec016357da536201139cCf5b6c1059',
        ],
    },
    polygon: {
        vaults: [
            '0xFABea2117d95b780077ca8dDf268BcC8c29589ED', // entry
            '0x98266478600d4Cae5082d2A185cc6533684dA108', // arbitrum satellite
            '0x4a307418cEd78A3f2348FD84e66453Efe0BDD16a', // optimisim satellite
        ],
        strategies: [
            '0x283D67CAAFc1AA4A2D54c62Be0A44EdFb8099099',
        ],
    },
    arbitrum: {
        vaults: [
            '0x98fCBbfb97B61e2DA167A69345c58e4126A5167B', // entry
            '0x801E78C94d5fffDD6F37684ad5ac68EF3b15E559', // polygon satellite
            '0x680924B3B81d918B01D43E80C092CF75C6063681', // optimisim satellite
        ],
        strategies: [
            '0x0Dba32cFaE7C7edf59603f1BC450DC15E0f46Ddf',
        ]
    },
}

module.exports = {
    contracts,
}