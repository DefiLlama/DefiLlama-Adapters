const sdk = require('@defillama/sdk')

const toAddr= d=>"0x"+d.substr(26)

const masterContract = "0x972a785b390D05123497169a04c72dE652493BE1"
const collaterals = ["0xdac17f958d2ee523a2206206994597c13d831ec7", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "0x6b175474e89094c44da98b954eedeac495271d0f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]
const betaBank = "0x972a785b390D05123497169a04c72dE652493BE1"

async function tvl(_timestamp, block){
    const bTokens = (await sdk.api.util.getLogs({
        target: masterContract,
        topic: "Create(address,address)",
        fromBlock: 13004429,
        toBlock: block,
        keys: []
    })).output.map(bt=>({
        target: toAddr(bt.topics[1]),
        params: [toAddr(bt.data)]
    })).concat(collaterals.map(c=>({
        target: c,
        params: [betaBank]
    })))
    const balanceOf = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: bTokens,
        block,
    })
    const balances={}
    sdk.util.sumMultiBalanceOf(balances, balanceOf, true)
    return balances
}

module.exports={
    methodology: 'TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.',
    ethereum:{
        tvl
    },
    tvl
}
