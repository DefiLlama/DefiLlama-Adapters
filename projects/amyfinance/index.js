const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');
const { transformArbitrumAddress } = require('../helper/portedTokens');
const { getBlock } = require('../helper/getBlock');

const tokens = [
    ["0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", false], //USDC
    ["0x82af49447d8a07e3bd95bd0d56f35241523fbab1", false], //WETH
    ["0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", false], //WBTC
    ["0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", false], //USDT
    ["0xf97f4df75117a78c1a5a0dbb814af92458539fb4", false], //LINK
    ["0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0", false], //UNI
    ["0x82e3a8f066a6989666b031d916c43672085b1582", false], //YFI
];
const aibContracts = [
    "0x320eE3F76F81A1AEF1e0B17AB163203E341f4cEB", //aibUSDC
    "0x8085fedcfd35D8346b98A2E3Beb58cFD88876BF9", //aibWETH
    "0xE19e4EE5e4e203fE78066efeA990cb79bA62D8Ac", //aibWBTC
    "0x31a617E3e69eE41FCF61a354f8e50fC4953053C7", //aibUSDT
    "0x55A9E5cdb11E9812B40233E504380C68a3b8C901", //aibLINK
    "0xa6256935758EC195E0B475756358C915c73c382A", //aibUNI
    "0x9bBa222ceCdbA87601B683Ba4A50276020DFC328", //aibYFI
];

async function tvl(timestamp, ethBlock, chainBlocks) {
    const block = await getBlock(timestamp, "arbitrum", chainBlocks);
    let balances = {};
    const transformAdress = await transformArbitrumAddress();

    await sumTokensAndLPsSharedOwners(balances, tokens, aibContracts, 
        block, "arbitrum", transformAdress);
    return balances;
}

module.exports = {
    tvl,
}
