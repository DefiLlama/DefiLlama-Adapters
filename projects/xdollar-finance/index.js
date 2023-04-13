const sdk = require("@defillama/sdk");
const BigNumber = require('bignumber.js')
const { transformBalances } = require('../helper/portedTokens.js')
const { staking } = require('../helper/staking')

const {getLiquityTvl} = require('../helper/liquity')

const ETH_ADDR = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const BTC_ADDR = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const USDC_ADDR = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

const iotexTMs = {
    "0x366D48c04B0d315acF27Bd358558e92D4e2E9f3D": "0xa00744882684c3e4747faefd68d283ea44099d03", // WIOTX
    "0x7204e2f210865aA1854F33B3532ab2DEb386CB59": "0xa00744882684c3e4747faefd68d283ea44099d03", // WIOTX v2
}
const iotexStableAPs = {
    "0x8Af0EE5A98609fEdaf301Af74d3ca4Da614eaD43": "0x84abcb2832be606341a50128aeb1db43aa017449", // BUSD_b
    "0xF524F844216069b167d65DCe68B24F3358260BD5": "0x6fbcdc1169b5130c59e72e51ed68a84841c98cd1", // USDT
    // "0x206aAF608d1DD7eA9Db4b8460B2Bf8647522f90a": "0xd6070ae98b8069de6b494332d1a1a81b6179d960", // any
    "0x84724DAEC2943B1FDd5250ffcF64dfa290606250": "0x84abcb2832be606341a50128aeb1db43aa017449", // BUSD_b v2
    "0xc67cF429b055D664c7Ba06c9F5D17d0692C554fC": "0x6fbcdc1169b5130c59e72e51ed68a84841c98cd1", // USDT v2
}
const ethStables = {
    "0xC0eb7718fF1B5fBF11cd314CbC212c167bF341DB": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
}
// node test.js projects/xdollar-finance/index.js

const iotexTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const calls = [];
    const transform = i => i
    for (const troveManager in iotexTMs) {
        calls.push({
            target: troveManager
        })
    }

    let getCollResults = await sdk.api.abi.multiCall({
        block: chainBlocks.iotex,
        calls: calls,
        abi: "uint256:getEntireSystemColl",
        chain: 'iotex'
    });

    getCollResults.output.forEach((getColl) => {
        let address = iotexTMs[getColl.input.target]
        let amount =  getColl.output

        address  = transform(address);

        if (address == 'iotex') {
            amount = parseInt(amount / 1e18)
        }
  
        balances[address] = BigNumber(balances[address]|| 0).plus(amount).toFixed()
    });

    const balanceOfCalls = []
    for (const activePool in iotexStableAPs) {
        balanceOfCalls.push({
            target: iotexStableAPs[activePool],
            params: activePool
        })
    }

    let balanceOfResults = await sdk.api.abi.multiCall({
        block: chainBlocks.iotex,
        calls: balanceOfCalls,
        abi: 'erc20:balanceOf',
        chain: 'iotex'
    });

    balanceOfResults.output.forEach((balanceOf) => {
        let address = balanceOf.input.target
        let amount =  balanceOf.output

        address  = transform(address);

        balances[address] = BigNumber(balances[address]|| 0).plus(amount).toFixed()
    });

    return transformBalances('iotex', balances)
};


const ethStableCollat = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    
    const balanceOfCalls = []
    for (const activePool in ethStables) {
        balanceOfCalls.push({
            target: ethStables[activePool],
            params: activePool
        })
    }

    let balanceOfResults = await sdk.api.abi.multiCall({
        block: ethBlock,
        calls: balanceOfCalls,
        abi: 'erc20:balanceOf',
        chain: 'ethereum'
    });

    balanceOfResults.output.forEach((balanceOf) => {
        let address = balanceOf.input.target
        let amount =  balanceOf.output

        balances[address] = BigNumber(balances[address]|| 0).plus(amount).toFixed()
    });

    return balances;
};


module.exports = {
    iotex: {
        tvl: iotexTvl,
    },
    ethereum: {
        tvl: sdk.util.sumChainTvls([
            getLiquityTvl(ETH_ADDR,"0x7ee5175dFBD7c66Aa00043493334845376E43a8a", "ethereum"),
            getLiquityTvl(BTC_ADDR,"0x675CD7d43d7665f851997B7F0f2B0265a213BAB8", "ethereum"),
            ethStableCollat
        ]) 
    },
    arbitrum: {
        tvl: getLiquityTvl('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',"0x561d2d58bdad7a723a2cf71e8909a409dc2112ec", "arbitrum"),
        staking: staking('0xc3fbc4056689cfab3f23809aa25004899ff4d75a','0x9eF758aC000a354479e538B8b2f01b917b8e89e7', 'arbitrum'),
    },
    polygon: {
        tvl: getLiquityTvl('0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',"0x68738A47d40C34d890168aB7B612A6f649f395e4", "polygon"),
        staking: staking('0x3509f19581afedeff07c53592bc0ca84e4855475','0x3dc7b06dd0b1f08ef9acbbd2564f8605b4868eea', 'polygon'),
    },
    avax: {
        tvl: getLiquityTvl('0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',"0x561d2d58bdad7a723a2cf71e8909a409dc2112ec", "avax"),
        staking: staking('0x68738a47d40c34d890168ab7b612a6f649f395e4','0x9ef758ac000a354479e538b8b2f01b917b8e89e7', 'avax', 'polygon:0x3dc7b06dd0b1f08ef9acbbd2564f8605b4868eea'),
    },
    hallmarks: [
      [Math.floor(new Date('2022-10-30')/1e3), 'XUSD is no longer counted as part of tvl'],
    ],
};
