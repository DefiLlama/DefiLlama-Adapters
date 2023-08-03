const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const BigNumber = require('bignumber.js')
const { transformBalances } = require('../helper/portedTokens.js')
const { staking } = require('../helper/staking')

const {getLiquityTvl} = require('../helper/liquity')

const ETH_ADDR = ADDRESSES.ethereum.WETH;
const BTC_ADDR = ADDRESSES.ethereum.WBTC;
const USDC_ADDR = ADDRESSES.ethereum.USDC;

const iotexTMs = {
    "0x366D48c04B0d315acF27Bd358558e92D4e2E9f3D": ADDRESSES.iotex.WIOTX, // WIOTX
    "0x7204e2f210865aA1854F33B3532ab2DEb386CB59": ADDRESSES.iotex.WIOTX, // WIOTX v2
}
const iotexStableAPs = {
    "0x8Af0EE5A98609fEdaf301Af74d3ca4Da614eaD43": ADDRESSES.iotex.BUSD_bsc, // BUSD_b
    "0xF524F844216069b167d65DCe68B24F3358260BD5": ADDRESSES.iotex.ioUSDT, // USDT
    // "0x206aAF608d1DD7eA9Db4b8460B2Bf8647522f90a": ADDRESSES.iotex.anyXIM, // any
    "0x84724DAEC2943B1FDd5250ffcF64dfa290606250": ADDRESSES.iotex.BUSD_bsc, // BUSD_b v2
    "0xc67cF429b055D664c7Ba06c9F5D17d0692C554fC": ADDRESSES.iotex.ioUSDT, // USDT v2
}
const ethStables = {
    "0xC0eb7718fF1B5fBF11cd314CbC212c167bF341DB": ADDRESSES.ethereum.USDC, // USDC
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
        tvl: getLiquityTvl(ADDRESSES.arbitrum.WETH,"0x561d2d58bdad7a723a2cf71e8909a409dc2112ec", "arbitrum"),
        staking: staking('0xc3fbc4056689cfab3f23809aa25004899ff4d75a','0x9eF758aC000a354479e538B8b2f01b917b8e89e7', 'arbitrum'),
    },
    polygon: {
        tvl: getLiquityTvl(ADDRESSES.polygon.WMATIC_2,"0x68738A47d40C34d890168aB7B612A6f649f395e4", "polygon"),
        staking: staking('0x3509f19581afedeff07c53592bc0ca84e4855475','0x3dc7b06dd0b1f08ef9acbbd2564f8605b4868eea', 'polygon'),
    },
    avax: {
        tvl: getLiquityTvl(ADDRESSES.avax.WAVAX,"0x561d2d58bdad7a723a2cf71e8909a409dc2112ec", "avax"),
        staking: staking('0x68738a47d40c34d890168ab7b612a6f649f395e4','0x9ef758ac000a354479e538b8b2f01b917b8e89e7', 'avax', 'polygon:0x3dc7b06dd0b1f08ef9acbbd2564f8605b4868eea'),
    },
    hallmarks: [
      [Math.floor(new Date('2022-10-30')/1e3), 'XUSD is no longer counted as part of tvl'],
    ],
};
