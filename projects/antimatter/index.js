const sdk = require("@defillama/sdk");
const abi = require('./abi.json')

const factory = "0x60d0769c4940cA58648C0AA34ecdf390a10F272e"
const usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7"
async function tvl(timestamp, ethBlock) {
    const balances = {};
    const contractsLength = await sdk.api.abi.call({
        target:factory,
        abi: abi.length,
        block:ethBlock
    })
    const calls = [];
    for(let i=0; i<Number(contractsLength.output); i++){
        calls.push({
            target: factory,
            params: [i]
        })
    }
    const [allCalls, allPuts] = await Promise.all([
        sdk.api.abi.multiCall({
            calls,
            block: ethBlock,
            abi: abi.allCalls
        }),
        sdk.api.abi.multiCall({
            calls,
            block: ethBlock,
            abi: abi.allPuts
        })
    ])
    const contracts = allCalls.output.concat(allPuts.output).map(result=>result.output)
    const underlying = await sdk.api.abi.multiCall({
        calls: contracts.map(contract=>({
            target: contract
        })),
        block: ethBlock,
        abi: abi.underlying
    });
    const underlyingBalances = await sdk.api.abi.multiCall({
        calls: underlying.output.map(call=>[{
            target: call.output,
            params: [call.input.target]
        },{
            target: usdt,
            params: [call.input.target]
        }]).flat(),
        block: ethBlock,
        abi: "erc20:balanceOf"
    });
    sdk.util.sumMultiBalanceOf(balances, underlyingBalances, true)

    return balances
}

module.exports = {
    ethereum: {
        tvl
    },
    tvl
}