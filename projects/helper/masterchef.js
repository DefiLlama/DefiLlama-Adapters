const sdk = require('@defillama/sdk');
const abi = require('./abis/masterchef.json')
const {unwrapUniswapLPs} = require('./unwrapLPs')
const { staking } = require("./staking");
const { pool2Exports } = require("./pool2");

async function addFundsInMasterChef(balances, masterChef, block, chain = 'ethereum', transformAddress=id=>id, poolInfoAbi=abi.poolInfo, ignoreAddresses = [], includeLPs = true) {
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

    symbols.output.forEach((symbol, idx) => {
        const balance = tokenBalances.output[idx].output;
        const token = symbol.input.target;
        if(ignoreAddresses.some(addr=>addr.toLowerCase() === token.toLowerCase())){
            return 
        }
        if(symbol.output.includes('LP') || symbol.output.includes('PGL') || symbol.output.includes('UNI-V2')) {
          if(includeLPs && balance){
            lpPositions.push({
                balance,
                token
            });
          }
        } else {
            sdk.util.sumSingleBalance(balances, transformAddress(token), balance)
        }
    })

    await unwrapUniswapLPs(
        balances,
        lpPositions,
        block,
        chain,
        transformAddress
    );
}

function masterChefExports(masterchef, chain, stakingToken, pool2Tokens){
    async function tvl(timestamp, ethBlock, chainBlocks){
        const balances = {};
      
        const transformAddress = addr=>`${chain}:${addr}`;
        await addFundsInMasterChef(balances, masterchef, chainBlocks[chain], chain, transformAddress, abi.poolInfo, [...pool2Tokens, stakingToken])
      
        return balances;
    };
    return {
        staking:{
          tvl: staking(masterchef, stakingToken, chain)
        },
        pool2:pool2Exports(masterchef, pool2Tokens, chain),
        tvl
    };
}

module.exports = {
    addFundsInMasterChef,
    masterChefExports
}