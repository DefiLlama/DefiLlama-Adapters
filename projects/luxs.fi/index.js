const sdk = require("@defillama/sdk");

const vaults = {
    'polygon': ["0xE770038935b8D4B0d98118A682D05ce84E489724", "0x5125b6AB66dBAE17ded9841195b572f8c97592Ee", "0x705Aa351FB6c43547FC7E033732d07a9bfa20B1d"],
    'arbitrum': ["0x997C0a71A6C6Cf8aE329F5730Cc01bfd1a176C9e", "0xC9bec60E78E011aA14555c4A13469bE8a0344633", "0xfE48c97F9AB4E65c567f53156f0988F36d97F9a5", "0x7455DF92B0Cd996906Da495724B4B27e8A4FFb21"],
    'bsc': ["0xE324D24fA26BB73f9C104850D44af99ccB18a612", "0x09104993F206cb53e7ac5dBC70DD974f68F1c407", "0xEDd43c446eA21a80eE388010d6db8EfbE366d604", "0x819f6fBD91D99420794Adefdb1604Bfc3182AC39", "0x0F6484f73eEc82024F8F6866f1fdb17B6D9Ce808"],
    'optimism': ["0x0348Bb2730daC30966Ff15849ca6Ae24a93A59C1", "0x5125b6AB66dBAE17ded9841195b572f8c97592Ee", "0x705Aa351FB6c43547FC7E033732d07a9bfa20B1d", "0xE770038935b8D4B0d98118A682D05ce84E489724", "0xEcc4e5e4BbA01E566dBEdBC4B4B817Abe7811Fa5", "0x4744c5EDc84dF3fEad0F5Dcb03de00370d738711", "0x7455DF92B0Cd996906Da495724B4B27e8A4FFb21", "0x15DDd2Fb8c6e9CcAd1D3753120E59fc3BFf9e324", "0xc5697053614EAb2C35e4f20E410C566D862b2213", "0xF291f7207D224Df1CF9702Ca15a33C77883cfCF8", "0x62301063130F11B8DB8141a667Bc33fFEAfC1408", "0x6573d525A70f564c2d65d80Cd9B216926504B77A"]
}

async function tvl(_, _b, _cb, { api, }) {
    const balances = {}
    const tokens = await api.multiCall({
        abi: 'address:token',
        calls: vaults[api.chain],
    })

    const totalBalance = await api.multiCall({
        abi: 'function totalBalance() public view returns (uint256)',
        calls: vaults[api.chain],
    })

    tokens.forEach((t, i) => sdk.util.sumSingleBalance(balances, t, totalBalance[i], api.chain))
    return balances
}

module.exports = {
    misrepresentedTokens: true,
    arbitrum: {
        tvl: tvl,
    },
    optimism: {
        tvl: tvl,
    },
    polygon: {
        tvl: tvl,
    },
    bsc: {
        tvl: tvl,
    },
    methodology:
    "TVL is counted from the LuxsFi vaults contracts"
};