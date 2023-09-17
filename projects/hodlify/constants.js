const contracts = {
    ethereum: {
        vaults: [
            // eth
            '0x62beB192eBF4790777a084ED482AE1A501b74D65',
        ],
        strategies: [
            '0xf1633e53140a6c9c898d2c82Dabf93D3289724cb', // stargate-eth
        ],
    },
    optimism: {
        vaults: [
            // usdc
            '0x034A4072E63aB05aF057e4E9aFC961EA584fB886', // entry
            '0xcf038417eac3bEa4be8f296B0Ed994e8410B6eBC', // polygon satellite
            '0x81C3b05753A40f7dd93F154eDC4112AF2F3B5B3b', // arbitrum satellite
            // eth
            '0x38B2023e7fF7Fe9a33dFF14350d94F017e538768',
        ],
        strategies: [
            '0xe6ab63FbDFec016357da536201139cCf5b6c1059', // stargate-usdc
            '0x45B29Ac9F509C6484457d80b66484FC5f2Acd888', // stargate-eth
        ],
    },
    polygon: {
        vaults: [
            '0xFABea2117d95b780077ca8dDf268BcC8c29589ED', // entry
            '0x98266478600d4Cae5082d2A185cc6533684dA108', // arbitrum satellite
            '0x4a307418cEd78A3f2348FD84e66453Efe0BDD16a', // optimisim satellite
        ],
        strategies: [
            '0x283D67CAAFc1AA4A2D54c62Be0A44EdFb8099099', // stargate-usdc
        ],
    },
    arbitrum: {
        vaults: [
            // usdc
            '0x98fCBbfb97B61e2DA167A69345c58e4126A5167B', // entry
            '0x801E78C94d5fffDD6F37684ad5ac68EF3b15E559', // polygon satellite
            '0x680924B3B81d918B01D43E80C092CF75C6063681', // optimisim satellite
            // eth
            '0xD7Aac4989D82361b3b4917DA9D51266E66edBe0a',
        ],
        strategies: [
            '0x0Dba32cFaE7C7edf59603f1BC450DC15E0f46Ddf', // stargate-usdc
            '0x5efD42C28D86F2628CE0629F2e5B05037252070a' // stargate-eth
        ]
    },
}

module.exports = {
    contracts,
}