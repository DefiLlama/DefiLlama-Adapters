
const { sumTokens2, } = require('./helper/unwrapLPs');
const abi = require("./pendle/abi.json");

const masterchefContract = '0x1f4b7660b6AdC3943b5038e3426B33c1c0e343E6'
const stakingContract = '0x995ef3a5D14b66Ac5C7Fa1a967F8D9Cd727452bA';
const tokens = [
    '0x9a92b5ebf1f6f6f7d93696fcd44e5cf75035a756', // FINN
    '0x8e643094fb9941e273c2190563d7c514d56c841b', // HBLP
    '0x6714cd1e19363dc613154ebe440172e41575c469', // PAWS
    '0xDCd92eb568157D3c1a6b3AE53ADF18a230bc304A', // HBLP
];
// node test.js projects/rivrkitty.js
async function pool2(api) {
    const { amount } = await api.call({
        target: masterchefContract,
        abi: abi.userInfo,
        params: [19, stakingContract],
    });
    api.add(tokens[3], amount)
    return sumTokens2({ api, owner: stakingContract, tokens, resolveLP: true, })
}

module.exports = {
    moonriver: {
        pool2,
        tvl: async () => ({})
    }
};