const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { getConfig } = require('../helper/cache')
const abi = require('./abi.json');

const yoloAddress = {
    'avax': "0x44f91814c5c766e0762c8c23d65759f631c0abbd",
    'polygon': "0x935b97586FE291750F46Bf4eD7BeB8E1c3d110A2",
    'optimism': "0x3Ff61F4d7e1d912CA3Cb342581B2e764aE24d017"
}
const zeroAddress = ADDRESSES.null;
const TOKENLIST_URL = "https://raw.githubusercontent.com/symphony-finance/token-list/master/symphony.tokenlist.json";

const calcTvl = async (balances, id, chain, block, transformAddress) => {
    const tokenList = (await getConfig('symphony', TOKENLIST_URL)).tokens
        .filter((data) => data.chainId == id && !data.extensions.isNative)
        .map((token) => token);

    const contractBalances = (await sdk.api.abi.multiCall({
        calls: tokenList.map((token) => ({
            target: token.address,
            params: yoloAddress[chain]
        })),
        abi: "erc20:balanceOf",
        block,
        chain,
    })).output;

    const totalFunds = (await sdk.api.abi.multiCall({
        calls: tokenList.map((token, i) => ({
            target: yoloAddress[chain],
            params: [
                token.address,
                contractBalances[i].success ? contractBalances[i].output : 0,
                token.extensions.strategy ?
                    token.extensions.strategy :
                    zeroAddress
            ]
        })),
        abi: abi["getTotalTokens"],
        block,
        chain,
    })).output

    for (let i = 0; i < tokenList.length - 1; i++) {
        if (totalFunds[i].success) {
            sdk.util.sumSingleBalance(
                balances,
                transformAddress(tokenList[i].address),
                totalFunds[i].output
            );
        }
    }
    return balances
};

const avaxTVL = async (chainBlocks) => {
    const balances = {};
    const transformAddress = addr => 'avax:'+addr
    await calcTvl(
        balances,
        43114,
        "avax",
        chainBlocks["avax"],
        transformAddress
    );
    return balances;
};

const polygonTvl = async (chainBlocks) => {
    const balances = {};
    const transformAddress = addr => 'polygon:'+addr
    await calcTvl(
        balances,
        137,
        "polygon",
        chainBlocks["polygon"],
        transformAddress
    );
    return balances;
};

const optimismTvl = async (chainBlocks) => {
    const balances = {};
    const transformAddress = addr => 'optimism:'+addr
    await calcTvl(
        balances,
        10,
        "optimism",
        chainBlocks["optimism"],
        transformAddress
    );
    return balances;
};

module.exports = {
    avax: { tvl: avaxTVL },
    polygon: { tvl: polygonTvl },
    optimism: { tvl: optimismTvl },
    methodology: "we only count tokens deposited in the yolo contract",
};
