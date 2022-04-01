const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const token0 = require('./abis/token0.json')
const {getPoolTokens, getPoolId} = require('./abis/balancer.json')
const getPricePerShare = require('./abis/getPricePerShare.json')
const {requery} = require('./requery')
const creamAbi = require('./abis/cream.json')
const { request, gql } = require("graphql-request");
const { unwrapCrv, resolveCrvTokens } = require('./resolveCrvTokens')

const yearnVaults = {
    // yvToken: underlying, eg yvYFI:YFI
    // yvYFI v2
    "0xe14d13d8b3b85af791b2aadd661cdbd5e6097db1": "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
    // yvWETH v2
    "0xa258c4606ca8206d8aa700ce2143d7db854d168c": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    // yvWETH v1
    "0xa9fe4601811213c340e850ea305481aff02f5b28": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    // yvUSDT v2
    "0x7da96a3891add058ada2e826306d812c638d87a7": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    // yvUSDC v2
    "0x5f18c75abdae578b483e5f43f12a39cf75b973a9": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    // yvcrvSTETH
    "0xdcd90c7f6324cfa40d7169ef80b12031770b4325": "0x06325440d014e39736583c165c2963ba99faf14e",
    // yvcrvIB
    "0x27b7b1ad7288079a66d12350c828d3c00a6f07d7": "0x5282a4ef67d9c33135340fb3289cc1711c13638c",
    // yvYFI FTM
    "0x2c850cced00ce2b14aa9d658b7cad5df659493db": "0x29b0Da86e484E1C0029B56e817912d778aC0EC69",
    // yvDAI FTM
    "0x637ec617c86d24e421328e6caea1d92114892439": "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
    // yvMIM FTM
    "0x0a0b23d9786963de69cb2447dc125c49929419d8": "0x82f0b8b456c1a451378467398982d4834b6829c1",
    // yvUSDC FTM
    "0xef0210eb96c7eb36af8ed1c20306462764935607": "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
    // yvWFTM FTM
    "0x0dec85e74a92c52b7f708c4b10207d9560cefaf0": "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"
}
async function unwrapYearn(balances, yToken, block, chain = "ethereum", transformAddress=(addr)=>addr) {
    //if (yearnVaults[yToken.toLowerCase()] == undefined) { return; };
    const underlying = yearnVaults[yToken.toLowerCase()];

    let pricePerShare = await sdk.api.abi.call({
        target: yToken,
        abi: getPricePerShare[1],
        block: block,
        chain: chain
    });
    if (pricePerShare == undefined) {
        pricePerShare = await sdk.api.abi.call({
            target: yToken,
            abi: getPricePerShare[0],
            block: block,
            chain: chain
        });
    };
    sdk.util.sumSingleBalance(balances, transformAddress(underlying),
        balances[(chain == 'ethereum' ? yToken : `${chain}:${yToken}`)] * pricePerShare.output / 10 **
        (await sdk.api.erc20.decimals(underlying, chain)).output);
    delete balances[(chain == 'ethereum' ? yToken : `${chain}:${yToken}`)];
};

const lpReservesAbi = { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }
const lpSuppliesAbi = {"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}
const token0Abi =  {"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}
const token1Abi = {"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}

/* lpPositions:{
    balance,
    token
}[]
*/
async function unwrapUniswapLPs(balances, lpPositions, block, chain='ethereum', transformAddress=(addr)=>addr, excludeTokensRaw = [], retry = false, uni_type = 'standard',) {
    const excludeTokens = excludeTokensRaw.map(addr=>addr.toLowerCase())
    const lpTokenCalls = lpPositions.map(lpPosition=>({
        target: lpPosition.token
    }))
    const lpReserves = sdk.api.abi.multiCall({
        block,
        abi: lpReservesAbi,
        calls: lpTokenCalls,
        chain
    })
    const lpSupplies = sdk.api.abi.multiCall({
        block,
        abi: lpSuppliesAbi,
        calls: lpTokenCalls,
        chain
      })
      const tokens0 = sdk.api.abi.multiCall({
        block,
        abi:token0Abi,
        calls: lpTokenCalls,
        chain
      })
      const tokens1 = sdk.api.abi.multiCall({
        block,
        abi:token1Abi,
        calls: lpTokenCalls,
        chain
      })
      if(retry){
        await Promise.all([
            [lpReserves, lpReservesAbi],
            [lpSupplies, lpSuppliesAbi],
            [tokens0, token0Abi],
            [tokens1, token1Abi]
        ].map(async call=>{
            await requery(await call[0], chain, block, call[1])
        }))
      }
      await Promise.all(lpPositions.map(async lpPosition => {
        try{
            let token0, token1, supply
            const lpToken = lpPosition.token
            const token0_ = (await tokens0).output.find(call=>call.input.target === lpToken)
            const token1_ = (await tokens1).output.find(call=>call.input.target === lpToken)
            const supply_ = (await lpSupplies).output.find(call=>call.input.target === lpToken)

            try {
                token0 = token0_.output.toLowerCase()
                token1 = token1_.output.toLowerCase()
                supply = supply_.output
                // console.log(token0_, supply_, token1_, lpToken)

            } catch(e) {
                // console.log(token0_, supply_, token1_, lpToken)
                // return;
                throw e
            }
            if(supply === "0"){
                return
            }

            let _reserve0, _reserve1
            if (uni_type === 'standard') {
                ({_reserve0, _reserve1} = (await lpReserves).output.find(call=>call.input.target === lpToken).output)
            }
            else if (uni_type === 'gelato') {
                const gelatoPools = sdk.api.abi.multiCall({
                    block,
                    abi: gelatoPoolsAbi,
                    calls: lpTokenCalls,
                    chain
                });
                const gelatoPool = (await gelatoPools).output.find(call=>call.input.target === lpToken).output
                const [ {output: _reserve0_}, {output: _reserve1_} ] = (await Promise.all([
                    sdk.api.erc20.balanceOf({
                        target: token0,
                        owner: gelatoPool,
                        block,
                        chain
                    })
                    ,sdk.api.erc20.balanceOf({
                        target: token1,
                        owner: gelatoPool,
                        block,
                        chain
                    })
                ]))
                _reserve0 = _reserve0_
                _reserve1 = _reserve1_
            }

            if(!excludeTokens.includes(token0)){
                const token0Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve0)).div(BigNumber(supply))
                sdk.util.sumSingleBalance(balances, await transformAddress(token0), token0Balance.toFixed(0))
            }
            if(!excludeTokens.includes(token1)){
                const token1Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve1)).div(BigNumber(supply))
                sdk.util.sumSingleBalance(balances, await transformAddress(token1), token1Balance.toFixed(0))
            }
          } catch(e){
              console.log(`Failed to get data for LP token at ${lpPosition.token} on chain ${chain}`)
              throw e
          }
      }))
}


// Mostly similar to unwrapGelatoLPs with only edits being gelatoToken0ABI, same for token1 and balances of tokens which are actually held by the contract which address is given by the read pool method
/* lpPositions:{
    balance,
    token
}[]
*/
const gelatoPoolsAbi = {"inputs":[],"name":"pool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}

async function unwrapGelatoLPs(balances, lpPositions, block, chain='ethereum', transformAddress=(addr)=>addr, excludeTokensRaw = [], retry = false) {
    const excludeTokens = excludeTokensRaw.map(addr=>addr.toLowerCase())
    const lpTokenCalls = lpPositions.map(lpPosition=>({
        target: lpPosition.token
    }))
    const lpReserves = sdk.api.abi.multiCall({
        block,
        abi: lpReservesAbi,
        calls: lpTokenCalls,
        chain
    })
    const lpSupplies = sdk.api.abi.multiCall({
        block,
        abi: lpSuppliesAbi,
        calls: lpTokenCalls,
        chain
      })
      const tokens0 = sdk.api.abi.multiCall({
        block,
        abi: token0Abi,
        calls: lpTokenCalls,
        chain
      })
      const tokens1 = sdk.api.abi.multiCall({
        block,
        abi: token1Abi,
        calls: lpTokenCalls,
        chain
      })

      // Different bit
      if(retry){
        await Promise.all([
            [lpReserves, lpReservesAbi],
            [lpSupplies, lpSuppliesAbi],
            [tokens0, token0Abi], 
            [tokens1, token1Abi]
        ].map(async call=>{
            await requery(await call[0], chain, block, call[1])
        }))
      }
      await Promise.all(lpPositions.map(async lpPosition => {
        try{
            const lpToken = lpPosition.token
            const token0 = (await tokens0).output.find(call=>call.input.target === lpToken).output.toLowerCase()
            const token1 = (await tokens1).output.find(call=>call.input.target === lpToken).output.toLowerCase()
            const supply = (await lpSupplies).output.find(call=>call.input.target === lpToken).output

            // Different bits
            const gelatoPool = (await gelatoPools).output.find(call=>call.input.target === lpToken).output
            const [ {output: _reserve0}, {output: _reserve1} ] = (await Promise.all([
                sdk.api.erc20.balanceOf({
                    target: token0,
                    owner: gelatoPool,
                    block,
                    chain
                })
                ,sdk.api.erc20.balanceOf({
                    target: token1,
                    owner: gelatoPool,
                    block,
                    chain
                })
            ]))

            if(!excludeTokens.includes(token0)){
                const token0Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve0)).div(BigNumber(supply))
                sdk.util.sumSingleBalance(balances, await transformAddress(token0), token0Balance.toFixed(0))
            }
            if(!excludeTokens.includes(token1)){
                const token1Balance = BigNumber(lpPosition.balance).times(BigNumber(_reserve1)).div(BigNumber(supply))
                sdk.util.sumSingleBalance(balances, await transformAddress(token1), token1Balance.toFixed(0))
            }
          } catch(e){
              console.log(`Failed to get data for LP token at ${lpPosition.token} on chain ${chain}`)
              throw e
          }
      }))
}

// pool will give you the amount of fUniV3_WETH_ABC held by the pool of the position token against that token total supply
const uniV3_nft_contract = '0xc36442b4a4522e871399cd717abdd847ab11fe88'
const abi_staking = {
    'univ3_positions': {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"positions","outputs":[{"internalType":"uint96","name":"nonce","type":"uint96"},{"internalType":"address","name":"operator","type":"address"},{"internalType":"address","name":"token0","type":"address"},{"internalType":"address","name":"token1","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickLower","type":"int24"},{"internalType":"int24","name":"tickUpper","type":"int24"},{"internalType":"uint128","name":"liquidity","type":"uint128"},{"internalType":"uint256","name":"feeGrowthInside0LastX128","type":"uint256"},{"internalType":"uint256","name":"feeGrowthInside1LastX128","type":"uint256"},{"internalType":"uint128","name":"tokensOwed0","type":"uint128"},{"internalType":"uint128","name":"tokensOwed1","type":"uint128"}],"stateMutability":"view","type":"function"}, 

    'erc721_tokenOfOwnerByIndex': {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}, 

    'token0': {"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}, 
    'token1': {"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
}
// Convert Uniswap v3 tick to a price (i.e. the ratio between the amounts of tokens: token1/token0)
const tickBase = 1.0001
function tick_to_price(tick) {
    return tickBase ** tick
}
// GraphQL query to get the pool information
const univ3_graph_url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
const univ3_graph_query = gql`
query position($block: Int, $position_id: ID!) {
    position (
        id: $position_id
        block: { number: $block }
    ) {
        id
        owner
        tickLower {tickIdx}
        tickUpper {tickIdx}
        liquidity
        pool {
            tick
            liquidity
            feeTier
            token0 { symbol decimals id }
            token1 { symbol  decimals id }
        }
    }
}`

async function getUniv3PositionBalances(position_id, block) {
    // Retrieve aTokens and reserves from graphql API endpoint
    const { position } = await request(
        univ3_graph_url,
        univ3_graph_query, {
            block: block,
            position_id: position_id 
        })
    
    // Extract pool parameters
    const pool = position['pool']
    const tick = pool['tick']
    const token0 = pool['token0']['id']
    const token1 = pool['token1']['id']
    // Retrieve these from the graphql query instead of onchain call
    const bottom_tick = position['tickLower']['tickIdx']
    const top_tick = position['tickUpper']['tickIdx']
    const liquidity = position['liquidity']
    
    // Compute square roots of prices corresponding to the bottom and top ticks
    const sa = tick_to_price(Math.floor(bottom_tick / 2))
    const sb = tick_to_price(Math.floor(top_tick / 2))
    const price = tick_to_price(tick)
    const sp = price ** 0.5
    // const decimals0 = pool['token0']['decimals']
    // const decimals1 = pool['token1']['decimals']
    // const adjusted_price = price / (10 ** (decimals1 - decimals0))

    // Compute real amounts of the two assets
    const amount0 = liquidity * (sb - sp) / (sp * sb)
    const amount1 = liquidity * (sp - sa)

    console.log(`Whole pool: amount0: ${(amount0 / 1e18).toFixed(1)} / amount1: ${(amount1 / 1e18).toFixed(1)}`)
    return {
        [token0]: amount0, 
        [token1]: amount1, 
    }
}
/*
// Could get some props of the position itself onchain rather than using uni-v3 graphql endpoint, but some information needed is missing like whole pool liq/tick etc
const {output: position_props} = await sdk.api.abi.call({
    block,
    abi: abi_staking['univ3_positions'],
    target: uniV3_nft_contract,
    params: position_id, // get the last one for demonstration
    chain: 'ethereum'
})
const bottom_tick = position_props['tickLower']
const top_tick = position_props['tickUpper']
const L = position_props['liquidity']
const token0 = position_props['token0']
const token1 = position_props['token1']
*/

/*
univ3_Positions:{
    vault,
    pool
}[]
*/
async function unwrapUniswapV3LPs(balances, univ3_Positions, block, chain='ethereum', transformAddress=(addr)=>addr, excludeTokensRaw = [], retry = false) {
    const excludeTokens = excludeTokensRaw.map(addr=>addr.toLowerCase())
    await Promise.all(univ3_Positions.map(async univ3_Position => {
        try{ 
            // Get share of that LP NFT inside the vault as balanceOf / totalSupply
            const {output: totalSupply} = await sdk.api.abi.call({
                block,
                abi: 'erc20:totalSupply',
                target: univ3_Position.vault,
                chain
            })
            const {output: heldLPshares} = await sdk.api.abi.call({
                block,
                abi: 'erc20:balanceOf',
                target: univ3_Position.vault,
                params: univ3_Position.pool,
                chain
            })
            const sharesRatio = heldLPshares / totalSupply

            /*
            const {output: uniV3_nft_count} = await sdk.api.abi.call({
                block,
                abi: 'erc20:balanceOf',
                target: uniV3_nft_contract,
                params: univ3_Position.vault,
                chain
            })
            */
           // Here we assume only the first nft position is retrieved
           // could look for more using uniV3_nft_count 
            const {output: position_id} = await sdk.api.abi.call({
                block,
                abi: abi_staking['erc721_tokenOfOwnerByIndex'],
                target: uniV3_nft_contract,
                params: [univ3_Position.vault, 0], 
                chain
            })

            const positionBalances = await getUniv3PositionBalances(position_id, block)

            // Add balances while multiplying amount by ratio of shares
            Object.entries(positionBalances).forEach(async entry => {
                const [key, value] = entry;
                if(!excludeTokens.includes(key)){
                    // balances[key] = BigNumber( balances[key] || 0 ).plus(sharesRatio * value);
                    sdk.util.sumSingleBalance(balances, await transformAddress(key), BigNumber(sharesRatio * value).toFixed(0))
                }
            });
            console.log(`ratio of the pool: ${(100 * sharesRatio).toFixed(1)}% of position_id ${position_id}`)
            
        } catch(e) {
            console.log(`Failed to get data for LP token vault at ${univ3_Position.vault} on chain ${chain}`)
            throw e
        }
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
// To be used when you don't know which tokens are LPs and which are not
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
async function sumTokensAndLPsSharedOwners(balances, tokens, owners, block, chain = "ethereum", transformAddress=id=>id){
    const balanceOfTokens = await sdk.api.abi.multiCall({
        calls: tokens.map(t=>owners.map(o=>({
            target: t[0],
            params: o
        }))).flat(),
        abi: 'erc20:balanceOf',
        block,
        chain
    })
    await requery(balanceOfTokens, chain, block, 'erc20:balanceOf')
    const isLP = {}
    tokens.forEach(token=>{
        isLP[token[0].toLowerCase()]=token[1]
    })
    const lpBalances = []
    balanceOfTokens.output.forEach((result, idx)=>{
        const token = result.input.target.toLowerCase()
        const balance = result.output
        if(isLP[token] === true){
            lpBalances.push({
                token,
                balance
            })
        } else {
            sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
        }
    })
    if(lpBalances.length > 0){
        await unwrapUniswapLPs(balances, lpBalances, block, chain, transformAddress)
    }
}

async function sumTokensSharedOwners(balances, tokens, owners, block, chain = "ethereum", transformAddress){
    if(transformAddress===undefined){
        transformAddress = addr=>`${chain}:${addr}`
    }
    await sumTokensAndLPsSharedOwners(balances, tokens.map(t=>[t,false]), owners, block, chain, transformAddress)
}

async function sumLPWithOnlyOneToken(balances, lpToken, owner, listedToken, block, chain = "ethereum", transformAddress=id=>id){
    const [balanceOfLP, balanceOfTokenListedInLP, lpSupply] = await Promise.all([
        sdk.api.erc20.balanceOf({
            target: lpToken,
            owner,
            block,
            chain
        }),
        sdk.api.erc20.balanceOf({
            target: listedToken,
            owner: lpToken,
            block,
            chain
        }),
        sdk.api.erc20.totalSupply({
            target: lpToken,
            block,
            chain
        }),
    ])
    sdk.util.sumSingleBalance(balances, transformAddress(listedToken), 
        BigNumber(balanceOfLP.output).times(balanceOfTokenListedInLP.output).div(lpSupply.output).times(2).toFixed(0)
    )
}

async function sumLPWithOnlyOneTokenOtherThanKnown(balances, lpToken, owner, tokenNotToUse, block, chain = "ethereum", transformAddress=id=>id){
    const [token0, token1] = await Promise.all([token0Abi, token1Abi]
        .map(abi=>sdk.api.abi.call({
            target: lpToken,
            abi,
            chain,
            block
        }).then(o=>o.output))
    )
    let listedToken = token0
    if(tokenNotToUse.toLowerCase() === listedToken.toLowerCase()){
        listedToken = token1
    }
    await sumLPWithOnlyOneToken(balances, lpToken, owner, listedToken, block, chain, transformAddress)
}


/*
tokens [
    [token, owner, isLP] - eg ["0xaaa", "0xbbb", true]
]
*/
async function sumTokensAndLPs(balances, tokens, block, chain = "ethereum", transformAddress=id=>id){
    const balanceOfTokens = await sdk.api.abi.multiCall({
        calls: tokens.map(t=>({
            target: t[0],
            params: t[1]
        })),
        abi: 'erc20:balanceOf',
        block,
        chain
    })
    const lpBalances = []
    balanceOfTokens.output.forEach((result, idx)=>{
        const token = result.input.target
        const balance = result.output
        if(tokens[idx][2]){
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

const balancerVault = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
async function sumBalancerLps(balances, tokensAndOwners, block, chain, transformAddress){
    const poolIds = sdk.api.abi.multiCall({
        calls: tokensAndOwners.map(t => ({
            target: t[0]
        })),
        abi: getPoolId,
        block,
        chain
    })
    const balancerPoolSupplies = sdk.api.abi.multiCall({
        calls: tokensAndOwners.map(t => ({
            target: t[0]
        })),
        abi: 'erc20:totalSupply',
        block,
        chain
    })
    const balanceOfTokens = sdk.api.abi.multiCall({
        calls: tokensAndOwners.map(t => ({
            target: t[0],
            params: t[1]
        })),
        abi: 'erc20:balanceOf',
        block,
        chain
    });
    const balancerPoolsPromise = sdk.api.abi.multiCall({
        calls: (await poolIds).output.map(o => ({
            target: balancerVault,
            params: o.output
        })),
        abi: getPoolTokens,
        block,
        chain
    })
    const [poolSupplies, tokenBalances, balancerPools] = await Promise.all([balancerPoolSupplies, balanceOfTokens, balancerPoolsPromise])
    tokenBalances.output.forEach((result, idx)=>{
        const lpBalance = result.output
        const balancerPool = balancerPools.output[idx].output
        const supply = poolSupplies.output[idx].output
        balancerPool.tokens.forEach((token, tokenIndex)=>{
            const tokensInPool = balancerPool.balances[tokenIndex]
            const underlyingBalance = BigNumber(tokensInPool).times(lpBalance).div(supply)
            sdk.util.sumSingleBalance(balances, transformAddress(token), underlyingBalance.toFixed(0));
        })
    })
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
    console.log('pre resolve csvTokens', balances)
    return resolveCrvTokens(balances, block, chain, transformAddress)
}

async function unwrapCreamTokens(balances, tokensAndOwners, block, chain = "ethereum", transformAddress=id=>id){
    const [balanceOfTokens, exchangeRates, underlyingTokens] = await Promise.all([
        sdk.api.abi.multiCall({
            calls: tokensAndOwners.map(t => ({
                target: t[0],
                params: t[1]
            })),
            abi: 'erc20:balanceOf',
            block,
            chain
        }),
        sdk.api.abi.multiCall({
            calls: tokensAndOwners.map(t => ({
                target: t[0],
            })),
            abi: creamAbi.exchangeRateStored,
            block,
            chain
        }),
        sdk.api.abi.multiCall({
            calls: tokensAndOwners.map(t => ({
                target: t[0],
            })),
            abi: creamAbi.underlying,
            block,
            chain
        })
    ])
    balanceOfTokens.output.forEach((balanceCall, i)=>{
        const underlying = underlyingTokens.output[i].output
        const balance = BigNumber(balanceCall.output).times(exchangeRates.output[i].output).div(1e18).toFixed(0)
        sdk.util.sumSingleBalance(balances, transformAddress(underlying), balance)
    })
}

module.exports = {
    unwrapYearn,
    unwrapCrv,
    unwrapUniswapLPs,
    unwrapUniswapV3LPs,
    addTokensAndLPs,
    sumTokensAndLPsSharedOwners,
    addBalanceOfTokensAndLPs,
    sumTokensAndLPs,
    sumTokens,
    sumBalancerLps,
    unwrapCreamTokens,
    sumLPWithOnlyOneToken,
    sumTokensSharedOwners,
    sumLPWithOnlyOneTokenOtherThanKnown, 
    unwrapGelatoLPs
}
