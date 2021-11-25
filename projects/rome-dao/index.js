const sdk = require('@defillama/sdk')
const { getBlock } = require('../helper/getBlock')
const {sumTokensSharedOwners} = require('../helper/unwrapLPs')

const treasury = '0xd4a7febd52efda82d6f8ace24908ae0aa5b4f956'
const dai = '0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844'
const frax = '0x1a93b23281cc1cde4c4741353f3064709a16197d'
async function tvl(timestamp, ethBlock, chainBlocks){
    const block = await getBlock(timestamp, "moonriver", chainBlocks, true)
    const balances = {}
    await sumTokensSharedOwners(balances, [dai, frax], [treasury], block, "moonriver")
    return balances
}

module.exports = {
    moonriver:{
        tvl
    }
}