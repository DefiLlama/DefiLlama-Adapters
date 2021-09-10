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
                if(srcToken.srcToken === ''){
                    return 'bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
                }
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
        if(compareAddresses(addr, "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7")){ //WAVAX
          return `avax:${addr}`
        }
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
    return (addr) => {
      return `okexchain:${addr}`;
    };
}

async function transformHecoAddress() {
  return (addr) => {
    return `heco:${addr}`;
  };
}

async function transformCeloAddress() {
    return (addr) => {
        if (addr.toLowerCase() === "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73") {
            //return "0xd71ecff9342a5ced620049e616c5035f1db98620" //sEUR
            return "celo-euro"
        }
        if (addr.toLowerCase() === "0x765de816845861e75a25fca122bb6898b8b1282a") {
            //return "0x8e870d67f660d95d5be530380d0ec0bd388289e1" //USDP
            return "celo-dollar"
        }
        if (addr.toLowerCase() === "0x471ece3750da237f93b8e339c536989b8978a438") {
            return "celo" //CELO
        }
        return `celo:${addr}`;
    };
}

async function transformHarmonyAddress() {
    const bridge = (await utils.fetchURL("https://be4.bridge.hmny.io/tokens/?page=0&size=1000")).data.content

    return (addr) => {
        if(compareAddresses(addr, "0x6983D1E6DEf3690C4d616b13597A09e6193EA013")){
            return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        }
        const srcToken = bridge.find(token => compareAddresses(addr, token.hrc20Address))
        if (srcToken !== undefined) {
            const prefix = srcToken.network === "BINANCE"?"bsc:":""
            return prefix+srcToken.erc20Address
        }
        return `harmony:${addr}`
    }
}

async function transformOptimismAddress() {
    const bridge = (await utils.fetchURL("https://static.optimism.io/optimism.tokenlist.json")).data.tokens

    return (addr) => {
        const dstToken = bridge.find(token => compareAddresses(addr, token.address))
        if (dstToken !== undefined) {
            const srcToken = bridge.find(token => dstToken.logoURI === token.logoURI && token.chainId === 1)
            if(srcToken !== undefined){
                return srcToken.address
            }
        }
        return `optimism:${addr}`
    }
}

function fixAvaxBalances(balances){
    for(const representation of ["avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", '0x9dEbca6eA3af87Bf422Cea9ac955618ceb56EfB4']){
        if(balances[representation] !== undefined){
            balances['avalanche-2'] = Number(balances[representation])/1e18
            delete balances[representation]
        }
    }
}

function fixHarmonyBalances(balances){
    for(const representation of ["harmony:0xcf664087a5bb0237a0bad6742852ec6c8d69a27a", '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a', 'harmony:0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a', '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a', 'bsc:0xdE976f3344cd9F06E451aF3A94a324afC3E154F4', 'bsc:0xde976f3344cd9f06e451af3a94a324afc3e154f4']){
        if(balances[representation] !== undefined){
            balances['harmony'] = Number(balances[representation])/1e18
            delete balances[representation]
        }
    }
}

async function transformKccAddress() {
    return (addr) => {
      return `kcc:${addr}`;
    };
  }

module.exports = {
    transformCeloAddress,
    transformFantomAddress,
    transformBscAddress,
    transformPolygonAddress,
    transformXdaiAddress,
    transformAvaxAddress,
    transformHecoAddress,
    transformHarmonyAddress,
    transformOptimismAddress,
    fixAvaxBalances,
    transformOkexAddress,
    transformKccAddress,
    fixHarmonyBalances
};
