const abi = require("./abi.json");
const { fetchURL } = require('../helper/utils')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api }) {
    const chainId = await api.getChainId()
    const markets = (await fetchURL(`https://prod.clober-api.com/${chainId}/markets`)).data.markets.map((market) => market.address)
    const base = await api.multiCall({  abi: abi.baseToken, calls: markets})
    const quote = await api.multiCall({  abi: abi.quoteToken, calls: markets})
    const tokens = [base, quote].flat()
    const symbols = await api.multiCall({  abi: 'erc20:symbol', calls: tokens})
    const putTokens = tokens.filter((_, i) => symbols[i].includes('$') &&  symbols[i].endsWith('PUT'))
    const ownerTokens = markets.map((v, i) => ([[base[i], quote[i]], v]))
    const putQutes = await api.multiCall({  abi: abi.quoteToken, calls: putTokens})
    const putUnderlying = await api.multiCall({  abi: 'address:underlyingToken', calls: putTokens})
    putTokens.forEach((v, i) => ownerTokens.push([[putQutes[i], putUnderlying[i]], v]))
    return sumTokens2({ api, ownerTokens, blacklistedTokens: putTokens, })
}
module.exports = {
    methodology: "TVL consists of assets deposited into market contracts",
    ethereum: { tvl },
    polygon: { tvl },
    arbitrum: { tvl },
    polygon_zkevm: { tvl }
}