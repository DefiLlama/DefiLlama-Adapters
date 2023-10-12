const sdk = require('@defillama/sdk');
const {default: BigNumber} = require('bignumber.js');
const {abi} = require("./abi");

const miltonAddresses = ['0x28BC58e600eF718B9E97d294098abecb8c96b687', // USDT
    '0x137000352B4ed784e8fa8815d225c713AB2e7Dc9', // USDC
    '0xEd7d74AA7eB1f12F83dA36DFaC1de2257b4e7523', // DAI
]

const assets = ['0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
]

const iporRouter = '0x16d104009964e694761C0bf09d7Be49B7E3C26fd'

const stEth = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'

const ammTreasuryEth = '0x63395EDAF74a80aa1155dB7Cd9BBA976a88DeE4E'

const V2DeploymentBlockNumber = 18333744

async function tvl(_, block) {
    if (block >= V2DeploymentBlockNumber) {
        return await calculateTvlForV2(block);
    } else {
        return await calculateTvlForV1(block);
    }
}

async function calculateTvlForV2(block) {
    const balances = {};

    // USDT, USDC, DAI
    const calls = assets.map(asset => ({target: iporRouter, params: asset}))
    const {output} = await sdk.api.abi.multiCall({
        abi: abi.getAmmBalance, calls, block,
    })

    const {output: decimals} = await sdk.api.abi.multiCall({
        abi: 'erc20:decimals', calls: assets.map(i => ({target: i})), block,
    })

    output.forEach(({output: {totalCollateralPayFixed, totalCollateralReceiveFixed, liquidityPool, vault}}, i) => {
        const balance = +totalCollateralPayFixed + +totalCollateralReceiveFixed + +liquidityPool
        const decimal = 18 - decimals[i].output
        sdk.util.sumSingleBalance(balances, assets[i], BigNumber(balance / (10 ** decimal)).toFixed(0))
    });

    // StETH
    const {output: stEthBalance} = await sdk.api.abi.call({
        abi: 'erc20:balanceOf', target: stEth, params: ammTreasuryEth, block,
    })
    sdk.util.sumSingleBalance(balances, stEth, stEthBalance)

    return balances;
}

async function calculateTvlForV1(block) {
    const balances = {};

    const calls = miltonAddresses.map(i => ({target: i}))
    const {output} = await sdk.api.abi.multiCall({
        abi: abi.getAccruedBalance, calls, block,
    })
    const {output: underlyings} = await sdk.api.abi.multiCall({
        abi: abi.getAsset, calls, block,
    })
    const tokens = underlyings.map(i => i.output)
    const {output: decimals} = await sdk.api.abi.multiCall({
        abi: 'erc20:decimals', calls: tokens.map(i => ({target: i})), block,
    })

    output.forEach(({output: {totalCollateralPayFixed, totalCollateralReceiveFixed, liquidityPool}}, i) => {
        const balance = +totalCollateralPayFixed + +totalCollateralReceiveFixed + +liquidityPool
        const decimal = 18 - decimals[i].output
        sdk.util.sumSingleBalance(balances, tokens[i], BigNumber(balance / (10 ** decimal)).toFixed(0))
    });

    return balances;
}

module.exports = {
    timetravel: true,
    methodology: `Counts the tokens locked in the AMM contracts to be used as collateral to Interest Rate Swaps derivatives, counts tokens provided as a liquidity to Liquidity Pool, counts interest gathered via Asset Manager in external protocols.`,
    ethereum: {
        tvl
    }
};
