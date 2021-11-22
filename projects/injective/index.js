const sdk = require('@defillama/sdk')
const {sumTokensSharedOwners} = require('../helper/unwrapLPs')

const inj = '0xe28b3b32b6c345a34ff64674606124dd5aceca30'
const oldHolder = '0x53f2b8cc450679d04c479a048dc3ff39a4D20D13'
const newHolder = '0xf955c57f9ea9dc8781965feae0b6a2ace2bad6f3'
async function tvl(_timestamp, ethBlock){
    const balances = {}
    await sumTokensSharedOwners(balances, [inj], [
        oldHolder,
        newHolder
    ], ethBlock)
    return balances
}
// Note: There are other ERC20 tokens in the contract address as well, notably USDT and WETH.
module.exports = {
    ethereum:{
        tvl
    }
}
