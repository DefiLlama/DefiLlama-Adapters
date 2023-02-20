const abi = require("./abi.json");
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = "0x93A43391978BFC0bc708d5f55b0Abe7A9ede1B91"

async function tvl(_, _b, _cb, { api }) {
    let tokenAddresses = await sdk.api2.abi.fetchList({
        target: FACTORY,
        itemAbi: abi.computeTokenAddress,
        lengthAbi: abi.nonce,
        ...api,
    })
    tokenAddresses = tokenAddresses.flat()
    let { output: markets } = await sdk.api.abi.multiCall({
        calls: tokenAddresses.map(token => ({ target: token })),
        abi: abi.market,
        ...api
    })
    markets = markets.map(m => (m.output))
    const { output: baseTokens } = await sdk.api.abi.multiCall({
        calls: markets.map(market => ({ target: market })),
        abi: abi.baseToken,
        ...api
    })
    const { output: quoteTokens } = await sdk.api.abi.multiCall({
        calls: markets.map(market => ({ target: market })),
        abi: abi.quoteToken,
        ...api
    })
    let balances = {}
    const tokens = baseTokens.concat(quoteTokens)
    await sumTokens2({ ...api, tokens: tokens.map((t) => (t.output)), owners: markets, balances })
    return balances
}
module.exports = {
    timetravel: true,
    methodology: "TVL consists of assets deposited into market contracts",
    ethereum: {
        tvl
    },
    polygon: {
        tvl
    },
    arbitrum: {
        tvl
    }
}