const utils = require('../helper/utils');
const sdk = require('@defillama/sdk')

async function transformFantomAddress() {
    const multichainTokens = (await utils.fetchURL('https://netapi.anyswap.net/bridge/v2/info')).data.bridgeList

    return (addr) => {
        // WFTM
        if (addr.toLowerCase() === "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83") {
            return "0x4e15361fd6b4bb609fa63c81a2be19d873717870"
        }
        if (addr.toLowerCase() === "0x658b0c7613e890ee50b8c4bc6a3f41ef411208ad") { // fETH
            return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        }
        if (addr.toLowerCase() === "0xe1146b9ac456fcbb60644c36fd3f868a9072fc6e") { // fBTC
            return "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
        }
        if (addr.toLowerCase() === "0x82f0b8b456c1a451378467398982d4834b6829c1") { // MIM
            return "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3"
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

function compareAddresses(a, b){
    return a.toLowerCase() === b.toLowerCase()
}

async function transformAvaxAddress() {
    const [bridgeTokensOld, bridgeTokensNew, bridgeTokenDetails] = await Promise.all([
        utils.fetchURL("https://raw.githubusercontent.com/0xngmi/bridge-tokens/main/data/penultimate.json"),
        utils.fetchURL("https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/avalanche_contract_address.json").then(r=>Object.entries(r.data)),
        utils.fetchURL("https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/token_list.json")
    ]);

    return (addr) => {
        const srcToken = bridgeTokensOld.data.find(token => compareAddresses(token["Avalanche Token Address"], addr))
        if (srcToken !== undefined && srcToken["Ethereum Token Decimals"] === srcToken["Avalanche Token Decimals"]) {
            return srcToken["Ethereum Token Address"]
        }
        const newBridgeToken = bridgeTokensNew.find(token=>compareAddresses(addr, token[1]))
        if(newBridgeToken !== undefined){
            const tokenName = newBridgeToken[0].split('.')[0]
            const tokenData = bridgeTokenDetails.data[tokenName];
            if(tokenData !== undefined){
                return tokenData.nativeContractAddress
            }
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

async function transformHecoAddress() {
  return (addr) => {
    return `heco:${addr}`;
  };
}

function fixAvaxBalances(balances){
    for(const representation of ["avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", '0x9dEbca6eA3af87Bf422Cea9ac955618ceb56EfB4']){
        if(balances[representation] !== undefined){
            balances['avalanche-2'] = Number(balances[representation])/1e18
            delete balances[representation]
        }
    }
}

module.exports = {
    transformFantomAddress,
    transformBscAddress,
    transformPolygonAddress,
    transformXdaiAddress,
    transformAvaxAddress,
    transformHecoAddress,
    fixAvaxBalances
};