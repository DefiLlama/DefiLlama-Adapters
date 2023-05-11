
const sdk = require('@defillama/sdk');
const { unwrapUniswapLPs, sumTokens2, } = require('./helper/unwrapLPs');
const abi = require("./pendle/abi.json");

const masterchefContract = '0x1f4b7660b6AdC3943b5038e3426B33c1c0e343E6'
const stakingContract = '0x995ef3a5D14b66Ac5C7Fa1a967F8D9Cd727452bA';
const tokens = [
    {
        address: '0x9a92b5ebf1f6f6f7d93696fcd44e5cf75035a756', // FINN
        isLP: false 
    },{
        address: '0x8e643094fb9941e273c2190563d7c514d56c841b', // HBLP
        isLP: true 
    },{
        address: '0x6714cd1e19363dc613154ebe440172e41575c469', // PAWS
        isLP: false 
    }, {
        address: '0xDCd92eb568157D3c1a6b3AE53ADF18a230bc304A', // HBLP
        isLP: true
    }
];
// node test.js projects/rivrkitty.js
async function pool2(timestamp, _block, { moonriver: block }) {
    const chain = 'moonriver'
    const balances = {};

    const masterChefDeposits = await sdk.api.abi.call({
        target: masterchefContract,
        abi: abi.userInfo,
        params: [19, stakingContract],
        block,
        chain: 'moonriver'
      });
    
    await unwrapUniswapLPs(
        balances,
        [{
            balance: masterChefDeposits.output.amount, 
            token: tokens[3].address
        }],
        block,
        'moonriver',
    );
    const tokens1 = tokens.filter(t => t.isLP).map(i => i.address)
    return sumTokens2({ balances, chain, block, owner: stakingContract, tokens: tokens1, resolveLP: true, })
}

module.exports = {
    moonriver: {
        pool2,
        tvl: async()=>({})
    }
};