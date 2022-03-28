const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs")
const { default: BigNumber } = require('bignumber.js')

const oldAllPairVault = "0xeF970A111dd6c281C40Eee6c40b43f24435833c2"
const newAllPairVault = "0x2bb8de958134afd7543d4063cafad0b7c6de08bc"
const STABLE_PARTNER_VAULTS = [
    "0xBD9495E42ec4a2F5DF1370A6DA42Ec9a4656E963",
    "0xb230B535D2cf009Bdc9D7579782DE160b795d5E8",
    "0x7EBa8a9cAcb4bFbf7e1258b402A8e7aA004ED9FD",
]

const NEAR_TOKEN = "0x85f17cf997934a597031b2e18a9ab6ebd4b9f6a4"
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const STABLE_PARTNER_TOKENS = [
    "0x4Eb8b4C65D8430647586cf44af4Bf23dEd2Bb794", // FRAX Price Index share,
    "0x36784d3B5aa8A807698475b3437a13fA20B7E9e1",  // Timeless
    "0x853d955aCEf822Db058eb8505911ED77F175b99e",  // Frax
    "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",  // FXS
    "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",  // FEI
    "0x0f2D719407FdBeFF09D87557AbB7232601FD9F29",  // Synapse
    "0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7",  // Gro
    "0x67B6D479c7bB412C54e03dCA8E1Bc6740ce6b99C",  // Kylin
    "0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e",  // Pool together
    "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",  // UMA
    "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",  // CVX
    "0xff20817765cb7f73d4bde2e66e067e58d11095c2",  // AMP
    "0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2",  // MTA
    "0x470ebf5f030ed85fc1ed4c2d36b9dd02e77cf1b7",  // TEMPLE
    "0x758b4684be769e92eefea93f60dda0181ea303ec",  // PHONON
    "0xc770eefad204b5180df6a14ee197d99d808ee52d",  // FOX
    "0xc7283b66eb1eb5fb86327f08e1b5816b0720212b",  // TRIBE
    WETH,
    NEAR_TOKEN,
]

const PARTNER_LPS = [
    "0x9241943c29eb0B1Fc0f8E5B464fbc14915Da9A57", // Uniswap V2: FEI-MTA
    "0x5d62134DBD7D56faE9Bc0b7DF3788f5f8DADE62d", // Uniswap V2: POOL-FEI
]

async function addEthBalances(addresses, block, balances) {
    await Promise.all(addresses.map(async (target) => {
        const ethBalance = (
            await sdk.api.eth.getBalance({
                target,
                block,
            })
        ).output;

        sdk.util.sumSingleBalance(
            balances,
            WETH,
            ethBalance
        )
    }))
}

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};

    await addEthBalances(STABLE_PARTNER_VAULTS, block, balances)

    const tokens = [
        ...STABLE_PARTNER_TOKENS.map(i => [i, false]),
        ...PARTNER_LPS.map(i => [i, true]),
    ];

    await sumTokensAndLPsSharedOwners(
        balances,
        tokens,
        STABLE_PARTNER_VAULTS,
        block,
    );

    if (balances[NEAR_TOKEN]) {
        balances.near = BigNumber(balances[NEAR_TOKEN]).dividedBy(10 ** 24).toFixed(0)
        delete balances[NEAR_TOKEN]
    }

    return balances;
}

function tvlForAllPair(allPairVault) {
    return async (timestamp, block) => {
        const vaults = (await sdk.api.abi.call({
            target: allPairVault,
            block,
            abi: abi.getVaults,
            params: [0, 9999] // It cuts at max length
        })).output
        //console.log(util.inspect(vaults, false, null, true /* enable colors */))
        const balances = {}
        for (const vault of vaults) {
            if (timestamp > Number(vault.startAt) && timestamp < Number(vault.redeemAt)) {
                vault.assets.forEach(asset => {
                    sdk.util.sumSingleBalance(balances, asset.token, asset.deposited)
                })
            }
        }
        return balances
    }
}

module.exports = {
    methodology: "Counts all tokens resting on upcoming vaults and the ones deposited on active vaults",
    tvl: sdk.util.sumChainTvls([...[oldAllPairVault, newAllPairVault].map(tvlForAllPair), tvl,])
}