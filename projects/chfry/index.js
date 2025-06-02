const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require('./abi.json');
const BigNumber = require("bignumber.js");


const fryerContracts = [
    // Fryer USDT
    "0xd1ffa2cbAE34FF85CeFecdAb0b33E7B1DC19024b",
    // Fryer DAI
    "0x87F6fAA87358B628498E8DCD4E30b0378fEaFD07",
    // Fryer USDC
    "0x7E271Eb034dFc47B041ADf74b24Fb88E687abA9C",
]

const USDT = ADDRESSES.ethereum.USDT;
const DAI = ADDRESSES.ethereum.DAI;
const USDC = ADDRESSES.ethereum.USDC;

async function tvl(timestamp, block) {
    let balances = {};

    const tvlUSDT = (await sdk.api.abi.call({
        target: fryerContracts[0],
        abi: abi['getTotalDeposited'],
        block: block
    })).output;
    const tvlDAI = (await sdk.api.abi.call({
        target: fryerContracts[1],
        abi: abi['getTotalDeposited'],
        block: block
    })).output;
    const tvlUSDC = (await sdk.api.abi.call({
        target: fryerContracts[2],
        abi: abi['getTotalDeposited'],
        block: block
    })).output;
    balances[USDT] = tvlUSDT;
    balances[DAI] = tvlDAI;
    balances[USDC] = tvlUSDC;
    return balances;
}

module.exports = {
    methodology: "TVL is being calculated as the total amount deposited in the lending protocol by users.",
    ethereum:{
        tvl,
    },
}
