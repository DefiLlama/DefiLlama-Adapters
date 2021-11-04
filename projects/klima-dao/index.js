const { staking } = require('../helper/staking')
const {sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')
const {transformPolygonAddress} = require('../helper/portedTokens')


const treasury = "0x7Dd4f0B986F032A44F913BF92c9e8b7c17D77aD7"

async function tvl(time, ethBlock, chainBlocks){
    const balances = {}
    const transform = await transformPolygonAddress()
    await sumTokensAndLPsSharedOwners(balances, [
        ["0x2f800db0fdb5223b3c3f354886d907a671414a7f", false],
        ["0x1e67124681b402064cd0abe8ed1b5c79d2e02f64", true],
        ["0x9803c7ae526049210a1725f7487af26fe2c24614", true]
    ], [treasury], chainBlocks.polygon, "polygon", transform)
    return balances
}

module.exports={
    fantom:{
        tvl,
        staking: staking("0x25d28a24Ceb6F81015bB0b2007D795ACAc411b4d", "0x4e78011ce80ee02d2c3e649fb657e45898257815", "polygon")
    }
}