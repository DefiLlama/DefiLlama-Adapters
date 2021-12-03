const abis = require('./abi.json');
const { Framework } = require('@vechain/connex-framework');
const { Driver, SimpleNet } = require('@vechain/connex-driver');

const net = new SimpleNet('https://mainnet.veblocks.net/');
const factory = '0xb312582c023cc4938cf0faea2fd609b46d7509a2';
let connex;

const tokenMapping = {
    '0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997': 'vechain',
    '0x0000000000000000000000000000456e65726779': 'vethor-token',
    '0x0CE6661b4ba86a0EA7cA2Bd86a0De87b0B860F14': 'oceanex-token',
    '0xf8e1fAa0367298b55F57Ed17F7a2FF3F5F1D1628': 'eight-hours',
    '0x89827F7bB951Fd8A56f8eF13C5bFEE38522F2E1F': 'plair',
    '0x1b8EC6C2A45ccA481Da6F243Df0d7A5744aFc1f8': 'decentbet',
    '0x5db3C8A942333f6468176a870dB36eEf120a34DC': 'safe-haven'
};

async function tvl() {
    let balances = {};
    const driver = await Driver.connect(net);
    connex = new Framework(driver);

    const allPairsLength = (await call(factory, abis.allPairsLength))[0];
    const allPairsArray = [...Array(Number(allPairsLength)).keys()];

    const allPairsPromises = allPairsArray.map(
        (id) => call(factory, abis.allPairs, [id]));
    const poolAddresses = await (
        await Promise.all(allPairsPromises)).map(p => p[0]);

    const token0Promises = poolAddresses.map(
        (add) => call(add, abis.token0))
    const token0Addresses = await (
        await Promise.all(token0Promises)).map(p => p[0]);

    const token1Promises = poolAddresses.map(
        (add) => call(add, abis.token1));
    const token1Addresses = await (
        await Promise.all(token1Promises)).map(p => p[0]);

    const reservesPromises = poolAddresses.map(
        (add) => call(add, abis.getReserves));
    const reserves = await (
        await Promise.all(reservesPromises))

    for (let n = 0; n < poolAddresses.length; n++) {
        if (Object.keys(tokenMapping).includes(token0Addresses[n])) {
            let token = tokenMapping[token0Addresses[n]];
            let poolBalance = reserves[n][0] * 2 / (10 ** 18);
            balances[token] = (token in balances ? 
                Number(balances[token]) + Number(poolBalance) : poolBalance);
        } else if (Object.keys(tokenMapping).includes(token1Addresses[n])) { 
            let token = tokenMapping[token1Addresses[n]];
            let poolBalance = reserves[n][1] * 2 / (10 ** 18);
            balances[token] = (token in balances ? 
                Number(balances[token]) + Number(poolBalance) : poolBalance);
        };
    };
    return balances;
};

async function call(addressContract, abi, params = []) {
    const Method = connex.thor.account(addressContract).method(abi);
    switch (params.length) {
        case 0:
            return (await Method.call()).decoded;
        case 1:
            return (await Method.call(params[0])).decoded;
    };
};

module.exports = {
    misrepresentedTokens: true,
    vechain: {
        tvl
    }
};