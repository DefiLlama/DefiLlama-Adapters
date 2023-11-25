const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { default: BigNumber } = require("bignumber.js");
const { getChainTransform, getFixBalances, } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk');

const fan_contract = "0x9842114F1d9c5286A6b8e23cF0D8142DAb2B3E9b"
const touch_contract = "0xC612eD7a1FC5ED084C967bD71F1e0F0a338Cf816"
const tft_address = "0x14acccd04393f26ba155e5402aa6fddbb8e2254a"
const zk_sync_swap_pool = "0xB075F49F4Bea5204d22B42E8d442e8E9e3400AF8"
const zk_sync_swap_usdc = "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4"
const stake_tft_contract_address = "0x38a22eFB9eE73EdABdc4A15B17D28b70bA56BDA3"
const getReserves_abi = "function getReserves() external view  returns (uint,uint)"
const vester_address = "0x13B8C03990b7d782cB9c3ebF7E2aA5Dc28f6133B"
const zk_sync_usdc_address = "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4"
const fee_staked = "0xd329AC402c3B63a9C6f78F7977CEb5C966785695"
const fee_distributor = "0x2fd93f195BF84aB804B2C81e0334cF5FD85D6Ca8"

async function getSwapPool({ api }) {
    const bal = await api.call({ abi: getReserves_abi, target: zk_sync_swap_pool })
    const [tft, usdc] = bal
    const tftAmout = BigNumber(tft)
    const usdcAmount = BigNumber(usdc)
    const tftPrice = usdcAmount.times(10 ** 12).div(tftAmout)
    return [tftPrice, BigNumber(usdc).times(2), tftAmout]
}
const getTvl = () => {
    return async function tvl(time, ethBlock, _b, { api }) {
        const [price, usdc, tftAmout] = await getSwapPool({ api })
        let balances = {}
        const ethBalances = await sumTokens2({ tokens: [nullAddress], owners: [fan_contract, touch_contract], api })
        balances = { ...ethBalances,["era:" + zk_sync_swap_usdc]: usdc.toFixed(0) }
        return balances
    }
}

const token0Abi = 'address:token0'
const token1Abi = 'address:token1'
const eth = BigNumber(10).pow(18)

async function getTftStaked({ chain, block }) {
    let transform = await getChainTransform(chain)
    const [bal, vesterAmount, reserveAmounts, token0, token1] = await Promise.all([
        sdk.api.erc20.balanceOf({
            target: tft_address,
            owner: stake_tft_contract_address,
            chain,
            block,
        }),
        sdk.api.erc20.balanceOf({
            target: tft_address,
            owner: vester_address,
            chain,
            block,
        }),
        ...[getReserves_abi, token0Abi, token1Abi].map(abi => sdk.api.abi.call({
            target: zk_sync_swap_pool,
            abi,
            chain,
            block
        }).then(o => o.output))
    ])
    let stakedBal;
    const [tft, usdc] = reserveAmounts
    const tftAmout = BigNumber(tft)
    const usdcAmount = BigNumber(usdc)
    const tftPrice = usdcAmount.times(10 ** 12).div(tftAmout)
    let one = BigNumber(0).times(eth)
    stakedBal = BigNumber(bal.output).plus(BigNumber(vesterAmount.output)).plus(one).times(tftPrice)
    let b = stakedBal.div(BigNumber(10 ** 12)).toFixed(0)
    const balances = {
        [transform(zk_sync_usdc_address)]: b
    }
    return balances
}

async function getEthBalance({ api }) {
    let balances = {}
    const ethBalances = await sumTokens2({ tokens: [nullAddress], owners: [fee_staked, fee_distributor], api })
    
    balances = { ...ethBalances }
    console.log("ethBalance",balances)
    return balances
}

function stakingUnknownPricedLP(chain) {
    return async (timestamp, _ethBlock, { [chain]: block }, { api }) => {
        const staked = await getTftStaked({ chain, block })
        const fee = await getEthBalance({ api })
        console.log("fee",fee)
        return {
            ...fee,
            ...staked
        }
    }
}

 function getTotalTvl() {
    return async (time, ethBlock, _b, { api }) => {
        const onGetStaked = stakingUnknownPricedLP("era")
        const staked = await onGetStaked(time, ethBlock, _b, { api:new sdk.ChainApi({block:_b["era"],chain:"era"}) })
        const onGetTvl = getTvl()
        const tvl = await onGetTvl(time, ethBlock, _b, { api })
        let balances = {}
        Object.keys(tvl).forEach((key) => {
            const t = BigNumber(tvl[key] || 0)
            const s = BigNumber(staked[key] || 0)
            balances[key] = t.plus(s).toFixed(0)
        })
        return balances
    }
}

module.exports = {
    methodology: `We count the ETH on ${fan_contract} and ${touch_contract} and zyncswap ${zk_sync_swap_pool}`,
    era: {
        tvl: getTotalTvl(),
        staking: stakingUnknownPricedLP("era")
    }
}