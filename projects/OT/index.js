const weth='0x9bd8c192a74566546f8998A29c1e0Ca10A47c359'
const swapContract = '0x84c18204c30da662562b7a2c79397C9E05f942f0';
const readContract = '0x2B3936A91454E6Ff94aFAf7b1e5Ae6FBaBc0e885';
async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
    const tokens = await api.call({ target: swapContract, abi: 'function getPoolTokenList() external view returns (address[])', });
    const tokenInfos = await api.call({ target: readContract, params: [tokens], abi: 'function bulkSwapPoolInfo(address[] memory tokens) public view returns (uint256[] memory reserveTokens,uint256[] memory reserveOsds, bool[] memory isUsePriceFeeds, bool[] memory isRebalancible,address[] memory liquidityList)' });
    let tvl={};
    for (let i = 0; i < tokens.length; i++) {
        let token=tokens[i];
        if(token.toLowerCase()===weth.toLowerCase()){
            token='0x0000000000000000000000000000000000000000'
        }
        const poolReserve = tokenInfos[0][i];
        tvl[`era:${token}`]=poolReserve
    }
    return tvl
}


module.exports = {
    era: {
        tvl
    },
};