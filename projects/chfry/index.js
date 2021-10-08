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

const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

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
    console.log(tvlUSDT);
    balances[USDT] = tvlUSDT;
    balances[DAI] = tvlDAI;
    balances[USDC] = tvlUSDC;
    return balances;
}

module.exports = {
    ethereum:{
        tvl,
    },
    tvl
}
