const sdk = require('@defillama/sdk');
const abi = require('./abis/masterchef.json')
const {unwrapUniswapLPs} = require('./unwrapLPs')
const { staking } = require("./staking");
const { pool2BalanceFromMasterChefExports } = require("./pool2");
const token0Abi = require("./abis/token0.json");
const token1Abi = require("./abis/token1.json");

async function addFundsInMasterChef(balances, masterChef, block, chain = 'ethereum', transformAddress=id=>id, poolInfoAbi=abi.poolInfo, ignoreAddresses = [], includeLPs = true, excludePool2 = false, stakingToken = undefined) {
    const poolLength = (
        await sdk.api.abi.call({
            abi: abi.poolLength,
            target: masterChef,
            block,
            chain,
        })
    ).output;

    const poolInfo = (
        await sdk.api.abi.multiCall({
            block,
            calls: Array.from(Array(Number(poolLength)).keys()).map(i => ({
                target: masterChef,
                params: i,
            })),
            abi: poolInfoAbi,
            chain,
        })
    ).output;

    const [symbols, tokenBalances] = await Promise.all([
        sdk.api.abi.multiCall({
            block,
            calls: poolInfo.map(p => ({
                target: p.output[0]
            })),
            abi: 'erc20:symbol',
            chain,
        }),
        sdk.api.abi.multiCall({
            block,
            calls: poolInfo.map(p => ({
                target: p.output[0],
                params: masterChef
            })),
            abi: 'erc20:balanceOf',
            chain,
        })
    ])

    const lpPositions = [];
    const lpTokens = [];

    symbols.output.forEach((symbol, idx) => {
        const balance = tokenBalances.output[idx].output;
        const token = symbol.input.target;
        if(ignoreAddresses.some(addr=>addr.toLowerCase() === token.toLowerCase()) || symbol.output === null){
            return 
        }
        if(symbol.output.includes('LP') || symbol.output.includes('PGL') || symbol.output.includes('UNI-V2')) {
          if(includeLPs && balance && !excludePool2){
            lpPositions.push({
                balance,
                token
            });
          }
          else if(includeLPs && balance && excludePool2) {
              lpTokens.push(token);
          }
        } else {
            sdk.util.sumSingleBalance(balances, transformAddress(token), balance)
        }
    })

    if (excludePool2) {
        const [token0, token1, balance] = await Promise.all([
            sdk.api.abi.multiCall({
                calls: lpTokens.map(p => ({
                    target: p
                })),
                abi: token0Abi,
                block,
                chain
            }),
            sdk.api.abi.multiCall({
                calls: lpTokens.map(p => ({
                    target: p
                })),
                abi: token1Abi,
                block,
                chain
            }),
            sdk.api.abi.multiCall({
                calls: lpTokens.map(p => ({
                    target: p,
                    params: masterChef
                })),
                abi: "erc20:balanceOf",
                block,
                chain
            })
        ]);
        
        [token0, token1, balance].forEach((_, idx) => {
            if (lpTokens[idx] === undefined || token0.output[idx].output.toLowerCase() === stakingToken.toLowerCase() || token1.output[idx].output.toLowerCase() === stakingToken.toLowerCase()) {
                return
            }
            lpPositions.push({
                balance: balance.output[idx].output,
                token: balance.output[idx].input.target
            });
        });
    }

    
    await unwrapUniswapLPs(
        balances,
        lpPositions,
        block,
        chain,
        transformAddress
    );
}

function masterChefExports(masterchef, chain, stakingToken){
    async function tvl(timestamp, ethBlock, chainBlocks){
        const balances = {};
      
        const transformAddress = addr=>`${chain}:${addr}`;
        await addFundsInMasterChef(balances, masterchef, chainBlocks[chain], chain, transformAddress, abi.poolInfo, [stakingToken], true, true, stakingToken);
      
        return balances;
    };
    return {
        staking:{
          tvl: staking(masterchef, stakingToken, chain)
        },
        pool2: {
          tvl: pool2BalanceFromMasterChefExports(masterchef, stakingToken, chain, addr=>`${chain}:${addr}`)
        },
        tvl
    };
}

module.exports = {
    addFundsInMasterChef,
    masterChefExports
}