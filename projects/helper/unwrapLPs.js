const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const crvPools = {
    '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490': {
        swapContract: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
        underlyingTokens: ['0xdac17f958d2ee523a2206206994597c13d831ec7', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0x6b175474e89094c44da98b954eedeac495271d0f'],
    },
    '0x194ebd173f6cdace046c53eacce9b953f28411d1': {
        swapContract: '0x0Ce6a5fF5217e38315f87032CF90686C96627CAA',
        underlyingTokens: ['0xdb25f211ab05b1c97d595516f45794528a807ad8', '0xd71ecff9342a5ced620049e616c5035f1db98620'],
    },
    '0x075b1bb99792c9e1041ba13afef80c91a1e70fb3': {
        swapContract: '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
        underlyingTokens: ['0xeb4c2781e4eba804ce9a9803c67d0893436bb27d', '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6'],
    },
    // Nerve
    '0xf2511b5e4fb0e5e2d123004b672ba14850478c14': {
        swapContract: '0x1B3771a66ee31180906972580adE9b81AFc5fCDc',
        underlyingTokens: ['0xe9e7cea3dedca5984780bafc599bd69add087d56', '0x55d398326f99059ff775485246999027b3197955', '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'],
    }
}

async function unwrapCrv(balances, crvToken, balance3Crv, block, chain = "ethereum", transformAddress=(addr)=>addr) {
    const crvSwapContract = crvPools[crvToken.toLowerCase()].swapContract
    const underlyingTokens = crvPools[crvToken.toLowerCase()].underlyingTokens
    const crvTotalSupply = sdk.api.erc20.totalSupply({
        target: crvToken,
        block,
        chain
    })
    const underlyingSwapTokens = (await sdk.api.abi.multiCall({
        calls: underlyingTokens.map(token => ({
            target: token,
            params: [crvSwapContract]
        })),
        block,
        chain,
        abi: 'erc20:balanceOf'
    })).output
    const resolvedCrvTotalSupply = (await crvTotalSupply).output
    underlyingSwapTokens.forEach(call => {
        const underlyingBalance = BigNumber(call.output).times(balance3Crv).div(resolvedCrvTotalSupply);
        sdk.util.sumSingleBalance(balances, transformAddress(call.input.target), underlyingBalance.toFixed(0))
    })
}
/* lpPositions:{
    balance,
    token
}[]
*/
async function unwrapUniswapLPs(balances, lpPositions, block, chain='ethereum', transformAddress=(addr)=>addr) {
    const lpTokenCalls = lpPositions.map(lpPosition=>({
        target: lpPosition.token
    }))
    const lpReserves = sdk.api.abi.multiCall({
        block,
        abi: { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" },
        calls: lpTokenCalls,
        chain
    })
    const lpSupplies = sdk.api.abi.multiCall({
        block,
        abi: {"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
        calls: lpTokenCalls,
        chain
      })
      const tokens0 = sdk.api.abi.multiCall({
        block,
        abi: {"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
        calls: lpTokenCalls,
        chain
      })
      const tokens1 = sdk.api.abi.multiCall({
        block,
        abi: {"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
        calls: lpTokenCalls,
        chain
      })
      await Promise.all(lpPositions.map(async lpPosition => {
        const lpToken = lpPosition.token
        const token0 = (await tokens0).output.find(call=>call.input.target === lpToken).output
        const token1 = (await tokens1).output.find(call=>call.input.target === lpToken).output
        const supply = (await lpSupplies).output.find(call=>call.input.target === lpToken).output
        const {_reserve0, _reserve1} = (await lpReserves).output.find(call=>call.input.target === lpToken).output

        const token0Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve0)).div(BigNumber(supply))
        sdk.util.sumSingleBalance(balances, await transformAddress(token0.toLowerCase()), token0Balance.toFixed(0))
        const token1Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve1)).div(BigNumber(supply))
        sdk.util.sumSingleBalance(balances, await transformAddress(token1.toLowerCase()), token1Balance.toFixed(0))
      }))
}

module.exports = {
    unwrapCrv,
    unwrapUniswapLPs
}
