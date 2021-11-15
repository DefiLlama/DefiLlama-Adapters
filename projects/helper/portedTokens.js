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
        if (addr.toLowerCase() === "0x82f0b8b456c1a451378467398982d4834b6829c1") { // MIM
            return "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3"
        }
        if(compareAddresses(addr, "0x260b3e40c714ce8196465ec824cd8bb915081812")){
            return "polygon:0x4a81f8796e0c6ad4877a51c86693b0de8093f2ef" // IRON ICE
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
        if(compareAddresses(addr, "0xaf2c034c764d53005cc6cbc092518112cbd652bb")){ //qiAVAX
            return `avax:0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7`
        }
        if(compareAddresses(addr, "0x57319d41F71E81F3c65F2a47CA4e001EbAFd4F33")){ //xJOE
            return `avax:0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd`
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
        if (addr.toLowerCase() == "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c") {
            return 'avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c'
        }
        if (addr.toLowerCase() == "0x2170ed0880ac9a755fd29b2688956bd959f933f8") {
            return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
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
        if(compareAddresses(addr, "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c")){
            return "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c"
        }
        return `okexchain:${addr}`;
    };
}

async function transformHecoAddress() {
  return (addr) => {
    if (addr.toLowerCase() == '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c') {
        return 'avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c'; 
    } else {
        return `heco:${addr}`;
    }
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
        if(compareAddresses(addr, "0x224e64ec1bdce3870a6a6c777edd450454068fec")){
            return "0xa47c8bf37f92abed4a126bda807a7b7498661acd"
        }
        if(compareAddresses(addr, "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c")){
            return "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c"
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
        if(compareAddresses(addr, "0x4200000000000000000000000000000000000006")){
            return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        }
        const dstToken = bridge.find(token => compareAddresses(addr, token.address) && token.chainId === 10)
        if (dstToken !== undefined) {
            const srcToken = bridge.find(token => dstToken.logoURI === token.logoURI && token.chainId === 1)
            if(srcToken !== undefined){
                return srcToken.address
            }
        }
        return addr //`optimism:${addr}` // TODO: Fix
    }
}

async function transformMoonriverAddress() {

    return (addr) => {
        if(compareAddresses(addr, "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c")){
            return "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c"
        }
        return `moonriver:${addr}` //`optimism:${addr}` // TODO: Fix
    }
}

async function transformArbitrumAddress() {
    const bridge = (await utils.fetchURL("https://bridge.arbitrum.io/token-list-42161.json")).data.tokens

    return (addr) => {
        if(compareAddresses(addr, "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A")){
            return "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3" // MIM
        }
        if(compareAddresses(addr, "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501")){
            return "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d" // renBTC
        }
        if(compareAddresses(addr, "0x9ef758ac000a354479e538b8b2f01b917b8e89e7")){
            return "polygon:0x3dc7b06dd0b1f08ef9acbbd2564f8605b4868eea" // XDO
        }

        const dstToken = bridge.find(token => compareAddresses(addr, token.address))
        if (dstToken !== undefined) {
            return dstToken.extensions.l1Address
        }
        return `arbitrum:${addr}`; 
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
        if(compareAddresses(addr, "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c")){
            return "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c"
        }
        if(compareAddresses(addr.toLowerCase(), "0x0039f574ee5cc39bdd162e9a88e3eb1f111baf48")){
            return "0xdac17f958d2ee523a2206206994597c13d831ec7"
        }
        if(compareAddresses(addr, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")){
            return "okexchain:0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85"
        }
        if(compareAddresses(addr, "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c")){
            return "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
        }
        if(compareAddresses(addr, "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d")){
            return "0x4fabb145d64652a948d72533023f6e7a623c7c53"
        }
        if(compareAddresses(addr, "0xc9baa8cfdde8e328787e29b4b078abf2dadc2055")){
            return "0x6b175474e89094c44da98b954eedeac495271d0f"
        }
        if(compareAddresses(addr, "0x218c3c3d49d0e7b37aff0d8bb079de36ae61a4c0")){
            return "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
        }
        if(compareAddresses(addr, "0xf55af137a98607f7ed2efefa4cd2dfe70e4253b1")){
            return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        }
        if(compareAddresses(addr, "0x980a5afef3d17ad98635f6c5aebcbaeded3c3430")){
            return "okexchain:0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85"
        }
        return `kcc:${addr}`;
    };
}

const chainTransforms = {
    celo: transformCeloAddress,
    fantom: transformFantomAddress,
    optimism: transformOptimismAddress,
    harmony: transformHarmonyAddress,
    arbitrum: transformArbitrumAddress,
}
async function getChainTransform(chain){
    if(chain === 'ethereum'){
        return id=>id
    }
    if(chainTransforms[chain]!== undefined){
        return chainTransforms[chain]()
    }
    return addr=>`${chain}:${addr}`
}

module.exports = {
    getChainTransform,
    transformCeloAddress,
    transformFantomAddress,
    transformBscAddress,
    transformPolygonAddress,
    transformXdaiAddress,
    transformAvaxAddress,
    transformHecoAddress,
    transformHarmonyAddress,
    transformOptimismAddress,
    transformMoonriverAddress,
    fixAvaxBalances,
    transformOkexAddress,
    transformKccAddress,
    transformArbitrumAddress,
    fixHarmonyBalances,
};
