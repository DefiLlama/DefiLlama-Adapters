const utils = require('../helper/utils');
const sdk = require('@defillama/sdk')

async function transformFantomAddress() {
    const multichainTokens = (await utils.fetchURL('https://netapi.anyswap.net/bridge/v2/info')).data.bridgeList

    return (addr) => {
        // WFTM
        if (addr.toLowerCase() === "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83") {
            return "0x4e15361fd6b4bb609fa63c81a2be19d873717870"
        }
        const srcToken = multichainTokens.find(token => token.chainId === "250" && token.token === addr.toLowerCase())
        if (srcToken !== undefined) {
            if (srcToken.srcChainId === '1') {
                return srcToken.srcToken;
            } else if (srcToken.srcChainId === '56') {
                return `bsc:${srcToken.srcToken}`;
            }
        }
        return `fantom:${addr}`
    }
}

async function transformAvaxAddress() {
    const bridgeTokens = (await utils.fetchURL("https://raw.githubusercontent.com/0xngmi/bridge-tokens/main/data/penultimate.json")).data

    return (addr) => {
        const srcToken = bridgeTokens.find(token => token["Avalanche Token Address"].toLowerCase() === addr.toLowerCase())
        if (srcToken !== undefined && srcToken["Ethereum Token Decimals"] === srcToken["Avalanche Token Decimals"]) {
            return srcToken["Ethereum Token Address"]
        }
        return `avax:${addr}`
    }
}

async function transformBscAddress() {
    const binanceBridge = (await utils.fetchURL("https://api.binance.org/bridge/api/v2/tokens?walletNetwork=")).data.data.tokens

    return (addr) => {
        const srcToken = binanceBridge.find(token => token.ethContractAddress !== "" && token.bscContractAddress.toLowerCase() === addr.toLowerCase())
        if (srcToken !== undefined && srcToken.bscContractDecimal === srcToken.ethContractDecimal) {
            return srcToken.ethContractAddress
        }
        return `bsc:${addr}`
    }
}

const PoSMappedTokenList = 'https://api.bridge.matic.network/api/tokens/pos/erc20'
const PlasmaMappedTokenList = 'https://api.bridge.matic.network/api/tokens/plasma/erc20'
async function transformPolygonAddress() {
    const posTokens = await utils.fetchURL(PoSMappedTokenList)
    const plasmaTokens = await utils.fetchURL(PlasmaMappedTokenList)
    const tokens = posTokens.data.tokens.concat(plasmaTokens.data.tokens).reduce((tokenMap, token) => {
        tokenMap[token.childToken.toLowerCase()] = token.rootToken.toLowerCase();
        return tokenMap;
    }, {})

    return (addr) => {
        if (addr.toLowerCase() === '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619') {
            return '0x0000000000000000000000000000000000000000'
        }
        return tokens[addr.toLowerCase()] || `polygon:${addr}`
    }
}

const bridgeAdd = '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d'
const abiXdaiBridgeAbi = {
    "type": "function",
    "stateMutability": "view",
    "payable": false,
    "outputs": [{
      "type": "address",
      "name": ""
    }],
    "name": "foreignTokenAddress",
    "inputs": [{
      "internalType": "address",
      "type": "address",
      "name": "_homeToken"
    }],
    "constant": true
  }
async function transformXdaiAddress() {
    return async (address) => {
        const result = await sdk.api.abi.call({
            target: bridgeAdd,
            abi: abiXdaiBridgeAbi,
            params: [address],
            chain: 'xdai'
        });
        if(result.output === "0x0000000000000000000000000000000000000000"){
            return `xdai:${address}`
        }
        return result.output
    }
}

async function transformOkexAddress() {
    const okexBridge = (await utils.fetchURL("https://www.okex.com/v2/asset/cross-chain/currencyAddress")).data.data.tokens
    // TODO
}

module.exports = {
    transformFantomAddress,
    transformBscAddress,
    transformPolygonAddress,
    transformXdaiAddress,
    transformAvaxAddress
};