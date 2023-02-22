const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const abi = require("./abi.json");
const depositor = '0xC204501F33eC40B8610BB2D753Dd540Ec6EA2646';
const { pool2s } = require("../helper/pool2");
const { staking } = require("../helper/staking");

async function addMasterchefFunds(balances, masterChef, block, transform){
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
            BigNumber(userInfo[i].output.amount).times(underlyingBalance[i].output).div(totalSupply[i].output).toFixed(0)
        );
    }
}

async function tvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const transform = addr => 'avax:'+addr;
    const block = chainBlocks.avax
    await addMasterchefFunds(balances, "0xb0523f9f473812fb195ee49bc7d2ab9873a98044", block, transform)
    await addMasterchefFunds(balances, "0x68c5f4374228BEEdFa078e77b5ed93C28a2f713E", block, transform)

    const vePTPRate = await sdk.api.abi.call({
        target: '0x5857019c749147EEE22b1Fe63500F237F3c1B692',
        abi: 'uint256:generationRate',
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
}

const pool2LPs = ["0x218e6A0AD170460F93eA784FbcC92B57DF13316E","0xc8898e2eEE8a1d08742bb3173311697966451F61"]

module.exports = {
    doublecounted: true,
    avax: {
        tvl,
        pool2: pool2s(["0xc9AA91645C3a400246B9D16c8d648F5dcEC6d1c8"], pool2LPs),
        staking: staking("0x721C2c768635D2b0147552861a0D8FDfde55C032","0xeb8343D5284CaEc921F035207ca94DB6BAaaCBcd")
    }
};