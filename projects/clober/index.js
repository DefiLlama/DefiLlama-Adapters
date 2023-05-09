const abi = require("./abi.json");
const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')

function calculateSalt(chainId, nonce) {
    return ethers.utils.solidityKeccak256(['uint256', 'uint256'], [chainId, nonce])
}

async function fetchTokenAddresses(api, chainId){
    if(chainId === 1 || chainId === 137 || chainId === 42161) {
        return await api.fetchList({
            lengthAbi: abi.nonce,
            itemAbi: "function computeTokenAddress(uint256) view returns (address)",
            target: "0x93A43391978BFC0bc708d5f55b0Abe7A9ede1B91"
        })
    }else if(chainId === 1101){
        const maxNonce = await api.call({ abi: abi.nonce, target: "0x24aC0938C010Fb520F1068e96d78E0458855111D" })
        return await api.multiCall({
            abi: "function computeTokenAddress(bytes32) view returns (address)",
            calls: Array.from({length: maxNonce}, (_, i) => i ).map((i, v) => ({ target: "0x58ed1f4913e652baF17C154551bd8E9dbc73fC56", params: calculateSalt(chainId, v) })),
        })
    }
}

async function tvl(_, _b, _cb, { api }) {
    const chainId = await api.getChainId()
    let tokenAddresses = await fetchTokenAddresses(api, chainId)
    tokenAddresses = tokenAddresses.flat()
    const markets = await api.multiCall({  abi: abi.market, calls: tokenAddresses })
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