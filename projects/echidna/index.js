const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { transformAvaxAddress } = require("../helper/portedTokens");
const abi = require("./abi.json");
const masterChef = '0xb0523f9f473812fb195ee49bc7d2ab9873a98044';
const depositor = '0xC204501F33eC40B8610BB2D753Dd540Ec6EA2646';

async function tvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const transform = await transformAvaxAddress();
    const block = chainBlocks.avax

    const poolLength = (await sdk.api.abi.call({
        target: masterChef,
        abi: abi.poolLength,
        block,
        chain: 'avax'
    })).output;

    const poolInfo = (await sdk.api.abi.multiCall({
        calls: [...Array(Number(poolLength)).keys()].map(n => ({
            target: masterChef,
            params: [n]
        })),
        abi: abi.poolInfo,
        block: block,
        chain: "avax"
    })).output;

    const userInfo = (await sdk.api.abi.multiCall({
        calls: [...Array(Number(poolLength)).keys()].map(n => ({
            target: masterChef,
            params: [n, depositor]
        })),
        abi: abi.userInfo,
        block: block,
        chain: "avax"
    })).output;

    const totalSupply = (await sdk.api.abi.multiCall({
        calls: poolInfo.map(p => ({
            target: p.output.lpToken,
        })),
        abi: abi.totalSupply,
        block: block,
        chain: "avax"
    })).output;

    const underlyingBalance = (await sdk.api.abi.multiCall({
        calls: poolInfo.map(p => ({
            target: p.output.lpToken,
        })),
        abi: abi.underlyingBalance,
        block: block,
        chain: "avax"
    })).output;

    const underlyingToken = (await sdk.api.abi.multiCall({
        calls: poolInfo.map(p => ({
            target: p.output.lpToken,
        })),
        abi: abi.underlyingToken,
        block: block,
        chain: "avax"
    })).output;

    for (let i = 0; i < userInfo.length; i++) {
        sdk.util.sumSingleBalance(
            balances,
            transform(underlyingToken[i].output),
            userInfo[i].output.amount * underlyingBalance[i].output / totalSupply[i].output
        );
    };

    const vePTPRate = await sdk.api.abi.call({
        target: '0x5857019c749147EEE22b1Fe63500F237F3c1B692',
        abi: {"inputs":[],"name":"generationRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        block: block,
        chain: "avax"
    })

    balances['avax:0x22d4002028f537599be9f666d1c4fa138522f9c8'] = new BigNumber((await sdk.api.abi.call({
        target: '0x5857019c749147EEE22b1Fe63500F237F3c1B692',
        params: [depositor],
        abi: 'erc20:balanceOf',
        block: block,
        chain: "avax"
    })).output).div(vePTPRate.output).times(1e12).toFixed(0);

    return balances;
};

module.exports = {
    doublecounted: true,
    avax: {
        tvl
    }
};