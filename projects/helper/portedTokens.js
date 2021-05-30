const utils = require('../helper/utils');

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

module.exports = {
    transformFantomAddress,
    transformBscAddress,
  };  