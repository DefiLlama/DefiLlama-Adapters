const abi = {
    "nonce": "uint256:nonce",
    "market": "address:market",
    "baseToken": "address:baseToken",
    "quoteToken": "address:quoteToken"
  };
const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')

const contractV1DeployedChainIds = [1, 137, 42161]
const contractV1_1DeployedChainIds = [137, 1101, 42161]

function calculateSalt(chainId, nonce) {
    return ethers.solidityPackedKeccak256(['uint256', 'uint256'], [chainId, nonce])
}

async function fetchTokenAddressesV1_0(api, chainId){
    if(!contractV1DeployedChainIds.includes(chainId)){
        return []
    }
    return await api.fetchList({
        lengthAbi: abi.nonce,
        itemAbi: "function computeTokenAddress(uint256) view returns (address)",
        target: "0x93A43391978BFC0bc708d5f55b0Abe7A9ede1B91"
    })
}

async function fetchTokenAddressesV1_1(api, chainId){
    if (!contractV1_1DeployedChainIds.includes(chainId)) {
        return []
    }
    const maxNonce = await api.call({ abi: abi.nonce, target: "0x24aC0938C010Fb520F1068e96d78E0458855111D" })
    return await api.multiCall({
        abi: "function computeTokenAddress(bytes32) view returns (address)",
        calls: Array.from({length: maxNonce}, (_, i) => i ).map((i, v) => ({ target: "0x58ed1f4913e652baF17C154551bd8E9dbc73fC56", params: calculateSalt(chainId, v) })),
    })
}

async function tvl(api) {
    const chainId = await api.getChainId()
    let tokenAddresses = [...await fetchTokenAddressesV1_0(api, chainId), ...await fetchTokenAddressesV1_1(api, chainId)]
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