const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { transformPolygonAddress } = require("../helper/portedTokens");

const OPTION_FACTORY_ETH = "0x43fF98EB7Ec681A7DBF7e2b2C3589E79d5ce11E3"
const OPTION_FACTORY_POLYGON = "0x8C9ac1a57891c9C2EE9Ae39cA7C1dC5D70e0D59C"

const REGISTRY_ETH = "0x8bf2ae0c5fd85ac69b25a22f4a58d528414f03ad"
const REGISTRY_POLYGON = "0x6038c646006a079C14d147EbbfD467A7d2B3a923"

const USDC_ETH = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const USDC_POLYGON = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"

const AUSDC_ETH = "0x9bA00D6856a4eDF4665BcA2C2309936572473B7E"
const AUSDC_POLYGON = "0x9719d867a500ef117cc201206b8ab51e794d3f82"

const FROM_BLOCK_ETH = 13221475
const FROM_BLOCK_POLYGON = 18383588 

async function ethTvl(time, ethBlock, chainBlocks) {
    const balances = {};

    await calcTvl(
        balances, 
        "ethereum", 
        ethBlock, 
        FROM_BLOCK_ETH, 
        OPTION_FACTORY_ETH, 
        REGISTRY_ETH, 
        USDC_ETH, 
        AUSDC_ETH
        );
  
    return balances;
}

async function polygonTvl(time, ethBlock, chainBlocks) {
    const balances = {};

    await calcTvl(
        balances, 
        "polygon", 
        chainBlocks["polygon"], 
        FROM_BLOCK_POLYGON, 
        OPTION_FACTORY_POLYGON, 
        REGISTRY_POLYGON, 
        USDC_POLYGON, 
        AUSDC_POLYGON,
        await transformPolygonAddress()
        );
  
    return balances;
}


async function calcTvl(
    balances, 
    chain, 
    block, 
    fromBlock, 
    optionFactory, 
    optionRegistry, 
    usdc, 
    ausdc, 
    transform=a=>a
    ){
    const options = (await sdk.api.util.getLogs({
        target: optionFactory,
        topic: 'OptionCreated(address,address,uint8,uint8,address,address,uint256,uint256,uint256)',
        fromBlock: fromBlock,
        keys:[],
        toBlock: block,
        ...(chain == "polygon" && { chain })
    })).output.map(ev=>'0x'+ev.data.substr(26, 40))

    const ammPools = (await sdk.api.abi.multiCall({
        abi: abi.getPool,
        block,
        calls: options.map(o=>({
            target: optionRegistry,
            params: [o]
        })),
        ...(chain == "polygon" && { chain })
    })).output.map(o=>o.output)

    const balanceOfs_USDC = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        block,
        calls: options.concat(ammPools).map(o=>({
            target: usdc,
            params: [o]
        })),
        ...(chain == "polygon" && { chain })
    })

    const balanceOfs_AUSDC = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        block,
        calls: options.concat(ammPools).map(o=>({
            target: ausdc,
            params: [o]
        })),
        ...(chain == "polygon" && { chain })
    })
    sdk.util.sumMultiBalanceOf(balances, balanceOfs_USDC, true, transform)
    sdk.util.sumMultiBalanceOf(balances, balanceOfs_AUSDC, true, transform)
    return balances
}

module.exports={
    ethereum: {
        tvl: ethTvl,
      },
      polygon: {
        tvl: polygonTvl,
      }
    }