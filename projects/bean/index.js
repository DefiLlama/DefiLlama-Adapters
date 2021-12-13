const {sumTokens} = require('../helper/unwrapLPs')

async function tvl(time, block){
    const balances = {}
    await sumTokens(balances, [["0xDC59ac4FeFa32293A95889Dc396682858d52e5Db", "0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5"]], block)
    return balances
}

module.exports={
    methodology: "Counts beans on silo",
    tvl
}