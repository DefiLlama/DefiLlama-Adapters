const sdk = require('@defillama/sdk');
const abi = require('./abis/masterchef.json')
const {unwrapUniswapLPs} = require('./unwrapLPs')

async function addFundsInMasterChef(balances, masterChef, block, chain = 'ethereum', transformAddress=id=>id, poolInfoAbi=abi.poolInfo, ignoreAddresses = []) {
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
        if(symbol.output.includes('LP') || symbol.output.includes('PGL')) {
            lpPositions.push({
                balance,
                token
            });
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

module.exports = {
    addFundsInMasterChef
}