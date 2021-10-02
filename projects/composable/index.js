const {chainExports} = require('../helper/exports')
const { sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')

const networks = {
    'ethereum': ['0xef4439f0fae7db0b5ce88c155fc6af50f1b38728', [
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', //usdc
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // eth
        '0xca3d75ac011bf5ad07a98d02f18225f9bd9a6bdf', // tricrypto
    ]],
    'arbitrum': ['0xEba8C2Bf0d1C9413543188fc42D7323690AED051',[
        '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', //usdc
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1' //eth
    ]],
    'polygon': ['0xcd8e7322dc2659b1ec447e5d52fdd9c67e8c3c01',[
        '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', //usdc
        '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619' //eth
    ]]
}

function chainTvl(chain){
    return async (_time, _ethBlock, chainBlocks)=>{
        const balances = {}
        const [owner, tokens] = networks[chain]
        await sumTokensAndLPsSharedOwners(balances, tokens.map(t=>[t, false]), [owner], chainBlocks[chain], chain, addr=>`${chain}:${addr}`)
        return balances
    }
}

module.exports=chainExports(chainTvl, Object.keys(networks))