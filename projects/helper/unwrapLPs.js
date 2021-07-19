const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const token0 = require('./abis/token0.json')

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
    },  // am3CRV Polygon
    "0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171": {
      swapContract: "0x445FE580eF8d70FF569aB36e80c647af338db351",
      underlyingTokens: [
        "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
        "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
      ]
    },
    // sCRV Eth
    "0xc25a3a3b969415c80451098fa907ec722572917f": {
      swapContract: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD",
      underlyingTokens: [
        "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "0x6b175474e89094c44da98b954eedeac495271d0f",
        "0x57ab1ec28d129707052df4df418d58a2d46d5f51"
      ]
    },
    // renBTC Eth
    "0x49849c98ae39fff122806c06791fa73784fb3675": {
      swapContract: "0x93054188d876f558f4a66B2EF1d97d16eDf0895B",
      underlyingTokens: [
        "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d",
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
      ]
    },
    // lusd Eth
    "0xed279fdd11ca84beef15af5d39bb4d4bee23f0ca": {
      swapContract: "0xed279fdd11ca84beef15af5d39bb4d4bee23f0ca",
      underlyingTokens: [
        "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
        "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490"
      ]
    },
    // steCRV Eth
    "0x06325440d014e39736583c165c2963ba99faf14e": {
      swapContract: "0xdc24316b9ae028f1497c275eb9192a3ea0f67022",
      underlyingTokens: ["0xae7ab96520de3a18e5e111b5eaab095312d7fe84"]
    },
    // fraxCRV Eth
    "0xd632f22692fac7611d2aa1c0d552930d43caed3b": {
      swapContract: "0xd632f22692fac7611d2aa1c0d552930d43caed3b",
      underlyingTokens: [
        "0x853d955acef822db058eb8505911ed77f175b99e",
        "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490"
      ]
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

    // steth case where balanceOf not applicable on ETH balance
    if (crvToken === "0x06325440d014e39736583c165c2963ba99faf14e") {
        underlyingSwapTokens[0].output = underlyingSwapTokens[0].output * 2;
    }

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

async function addBalanceOfTokensAndLPs(balances, balanceResult, block){
    await addTokensAndLPs(balances, {
        output: balanceResult.output.map(t=>({output:t.input.target}))
    },
    balanceResult,
    block)
}

// Unwrap the tokens that are LPs and directly add the others
async function addTokensAndLPs(balances, tokens, amounts, block, chain = "ethereum", transformAddress=id=>id){
    const tokens0 = await sdk.api.abi.multiCall({
        calls:tokens.output.map(t=>({
            target: t.output
        })),
        abi: token0,
        block,
        chain
    })
    const lpBalances = []
    tokens0.output.forEach((result, idx)=>{
        const token = tokens.output[idx].output
        const balance = amounts.output[idx].output
        if(result.success){
            lpBalances.push({
                token,
                balance
            })
        } else {
            sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
        }
    })
    await unwrapUniswapLPs(balances, lpBalances, block, chain, transformAddress)
}

function addressesEqual(a,b){
    return a.toLowerCase() === b.toLowerCase()
}
/*
tokens [
    [token, isLP] - eg ["0xaaa", true]
]
*/
async function sumTokensAndLPs(balances, tokens, owners, block, chain = "ethereum", transformAddress=id=>id){
    const balanceOfTokens = await sdk.api.abi.multiCall({
        calls: tokens.map(t=>owners.map(o=>({
            target: t[0],
            params: o
        }))).flat(),
        abi: 'erc20:balanceOf',
        block,
        chain
    })
    const lpBalances = []
    balanceOfTokens.output.forEach((result, idx)=>{
        const token = result.input.target
        const balance = result.output
        if(tokens.find(t=>addressesEqual(t[0], token))[1]){
            lpBalances.push({
                token,
                balance
            })
        } else {
            sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
        }
    })
    await unwrapUniswapLPs(balances, lpBalances, block, chain, transformAddress)
}

/*
tokensAndOwners [
    [token, owner] - eg ["0xaaa", "0xbbb"]
]
*/
async function sumTokens(balances, tokensAndOwners, block, chain = "ethereum", transformAddress=id=>id){
    const balanceOfTokens = await sdk.api.abi.multiCall({
        calls: tokensAndOwners.map(t=>({
            target: t[0],
            params: t[1]
        })),
        abi: 'erc20:balanceOf',
        block,
        chain
    })
    balanceOfTokens.output.forEach((result, idx)=>{
        const token = result.input.target
        const balance = result.output
        sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
    })
}

module.exports = {
    unwrapCrv,
    unwrapUniswapLPs,
    addTokensAndLPs,
    sumTokensAndLPs,
    addBalanceOfTokensAndLPs,
    sumTokens
}
