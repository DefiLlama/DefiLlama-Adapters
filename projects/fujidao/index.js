const {sumTokens} = require('../helper/unwrapLPs')

async function tvl(_timestamp, ethBlock){
    const balances = {}
    await sumTokens(balances, [
        ["0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5", "0x6E16394cBF840fc599FA3d9e5D1E90949c32a4F5"],
        ["0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5", "0xCA26d96B45111A130AF78D69E1DB283975547D67"],
        ["0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5", "0xd0dc4Cc10fCf3fEe2bF5310c0E4e097b60F097D3"]
    ], ethBlock)
    return balances
}

module.exports = {
    tvl,
    methodology: "Counts the c-tokens on all vaults, "
}