const sdk = require('@defillama/sdk')
const { getBlock } = require('../helper/getBlock')

async function tvl(time, ethB, cB){
    const block = await getBlock(time, "songbird", cB)
    return {
        "songbird": Number(
            (await sdk.api.erc20.balanceOf({target: "0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED", owner: "0xFa21A4ABD1a58CefAB79CFd597aCcc314403eE9f", block, chain:'songbird'})).output
        )/1e18
    }
}

module.exports={
    methodology: "We count all WSGB on 0xFa21A4ABD1a58CefAB79CFd597aCcc314403eE9f, which is backing the stablecoin",
    songbird: {
        tvl
    }
}