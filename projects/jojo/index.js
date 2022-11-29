const sdk = require('@defillama/sdk');
const {getBlock} = require("../helper/getBlock");
const {chains} = require("../wowswap/constants");


const contracts = [
    '0x25173BB47CB712cFCDFc13ECBebDAd753090801E'
];

const tokens = [
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
];

async function tvl (timestamp, _, {bsc: block}) {
    const balances = {};
    let balanceOfCalls = [];
    contracts.forEach((contract) => {
        balanceOfCalls = [
            ...balanceOfCalls,
            ...tokens.map((token) => ({
                target: token,
                params: contract
            }))
        ];
    });
    const balanceOfResult = (await sdk.api.abi.multiCall({
        block,
        calls: balanceOfCalls,
        abi: 'erc20:balanceOf',
        chain: `bsc`
    }));

    balanceOfResult.output.forEach((tokenBalanceResult) => {
        const valueInToken = tokenBalanceResult.output;
        sdk.util.sumSingleBalance(balances, `bsc:`+tokenBalanceResult.input.target, valueInToken)
    });

    return balances;
}

module.exports = {
    bsc: { tvl }
};
