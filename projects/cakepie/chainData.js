async function getNativeToken(chainId) {
    const currentChainId = chainId ? chainId : getDefaultNetworkID();
    if (currentChainId == 42161) {
        return "ETH";
    } else if (currentChainId == 1) {
        return "ETH";
    } else if (currentChainId == 10) {
        return "ETH";
    } else if (currentChainId == 56) {
        return "BNB";
    } else {
        return "ETH";
    }
};

module.exports = getNativeToken;
