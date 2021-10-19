const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("./helper/unwrapLPs")
const { transformBscAddress } = require("./helper/portedTokens");
const BigNumber = require('bignumber.js');
const { sumSingleBalance } = require("@defillama/sdk/build/generalUtil");

const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';

const oraichainToken = {
    'bsc': '0xa325ad6d9c92b55a3fc5ad7e412b1518f96441c0',
    'ethereum': '0x4c11249814f11b9346808179cf06e71ac328c1b5'
};

const lpToken = {
    'bsc': '0xF7697Db76FBf4Ba5D22c0C72AB986cf751FBa3aF',
    'ethereum': '0x9081b50bad8beefac48cc616694c26b027c559bb'
};

const stakingAddresses = {
    'bsc': [
        '0x12BC187A741B5fcBF34DE88Cb87527A29BEab750',
        '0xB997800DDf3e46be4683d2d444868F1E632f79Ac',
        '0xF33e0597183266e163895F99540420b8A13F8d95',
        '0x2d1368d32d8027041c890b77af02c848dbe4288b',
        '0x78850f0822c8da6a9d06031360f2b7ed1694105e'
    ],
    'ethereum': [
        '0x18eb0132b516d5622f630DCFCaD4b17789372632', //LP
        '0x51772eFd4b6d0b5e69C9e77b7B661Ea8D417A66F', //LP
        '0xc187c9782364e3db55802f3a51ac887ca8d1b43a',
        '0x8dcff4f1653f45cf418b0b3a5080a0fdcac577c8',
        '0x289268e0b5f05e514834ea37aa9777ce077696a0', //LP
        '0xb4d6bafed9c6451aeb15665982b55af5913f22cf'  //LP
    ],
    'tether': '0xdC398B05E6646764C0bF02ead1dE2ec192d64F7d' //USDT
};

async function tvl(chainBlocks, chain, transform=a=>a) {
    let balances = {};

    const lpBalance = (await sdk.api.abi.multiCall({
        abi: "erc20:balanceOf",
        target: lpToken[chain],
        calls: stakingAddresses[chain].map((a)=>({
            params: a
        })),
        block: chainBlocks[chain],
        chain
    })).output.map((c) => c.output).reduce((a, b) => Number(a) + Number(b), 0);

    await unwrapUniswapLPs(
        balances, 
        [{balance: lpBalance, token: lpToken[chain]}], 
        chainBlocks[chain], 
        chain, 
        transform);

        const tokenBalances = (await sdk.api.abi.multiCall({
        abi: "erc20:balanceOf",
        target: oraichainToken[chain],
        calls: stakingAddresses[chain].map((a)=>({
            params: a
        })),
        block: chainBlocks[chain],
        chain
    })).output.map((c) => c.output);

    for (balance of tokenBalances) {
        await sumSingleBalance(balances, transform(oraichainToken[chain]), balance);
    }

    return balances;
};

async function ethTvl(timestamp, ethBlock, chainBlocks) {
    let balances = await tvl(chainBlocks, 'ethereum');

    // AI USDT Vault
    const usdtBalance = (await sdk.api.erc20.balanceOf({
        ethBlock,
        target: usdtAddress,
        owner: stakingAddresses['tether']
    })).output;
    sdk.util.sumSingleBalance(balances, usdtAddress, usdtBalance);
    return balances;
};

async function bscTvl(timestamp, ethBlock, chainBlocks) {
    return await tvl(chainBlocks, 'bsc', await transformBscAddress());
};

module.exports = {
    ethereum: {
      staking: ethTvl,
    },
    bsc: {
      staking: bscTvl,
    },
    tvl: async ()=>({})
}