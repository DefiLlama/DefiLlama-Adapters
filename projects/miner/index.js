const { stakings } = require('../helper/staking')
const { sumTokens2 } = require('../helper/unwrapLPs')

const tvlContracts = [
    {
        address: '0xb5f2aCE1CBa02D59dDe4f783753F4822801B0BF3', // UniV3Pool
        token: '0x23CbB9F0de3258DE03baaD2BCeA4FCCC55233af0',
    },
]

async function findBalances(contracts, api) {
    const tokensAndOwners = contracts.map((i) => [i.token, i.address])
    return sumTokens2({ api, tokensAndOwners })
}

async function tvl(api) {
    return await findBalances(tvlContracts, api)
}

module.exports = {
    misrepresentedTokens: true,
    ethereum: {
        tvl,
        staking: stakings(
            [
                '0x335D87736b4693E5ED3e5C4f6C737A5a87aFA029',
                '0x39cae2CE1bFC446d22b423D08CfC50F04DFD10b6',
                '0xDc0fE7b8579995ABf20b1FCb61Fd57986844b6Ac',
            ],
            [
                '0x23CbB9F0de3258DE03baaD2BCeA4FCCC55233af0',
                '0x68BbEd6A47194EFf1CF514B50Ea91895597fc91E',
                '0xDc0fE7b8579995ABf20b1FCb61Fd57986844b6Ac',
            ]
        ),
    },
    base: {
        tvl: stakings(
            ['0x335D87736b4693E5ED3e5C4f6C737A5a87aFA029'],
            ['0x18A8BD1fe17A1BB9FFB39eCD83E9489cfD17a022']
        ),
    },
}