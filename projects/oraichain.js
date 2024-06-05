const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens2 } = require("./helper/unwrapLPs")

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
        '0xb4d6bafed9c6451aeb15665982b55af5913f22cf',  //LP
        '0xdC398B05E6646764C0bF02ead1dE2ec192d64F7d' //USDT
    ],
};
async function tvl(api) {
    const tokens = [lpToken[api.chain], oraichainToken[api.chain]]
    if (api.chain === 'ethereum') tokens.push(ADDRESSES.ethereum.USDT)
    return sumTokens2({ api, owners: stakingAddresses[api.chain], tokens, resolveLP: true,  })
}

module.exports = {
    ethereum: {
        staking: tvl,
        tvl: async () => ({}),
    },
    bsc: {
        staking: tvl,
    },
}