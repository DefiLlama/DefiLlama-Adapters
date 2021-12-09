const { staking } = require('../helper/staking')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')

async function tvl(_time, _ethBlock, chainBlocks){
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [
        ["0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a", false],
        ["0x79f12596b78f9e982bdab6e2d83d4bc155672372", false],
        ["0x40c938444c725ea6eb6992ca71f94b6945b43335", true],
        ["0x739ca6d71365a08f584c8fc4e1029045fa8abc4b", false]
    ], ["0x00efcbd55b59b5d08f3a7501c0ddad34a57a3611"], chainBlocks.arbitrum, "arbitrum", 
    addr=>{
        if(["0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a", "0x79f12596b78f9e982bdab6e2d83d4bc155672372"].includes(addr)){
            return "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3" // MIM
        }
        return `arbitrum:${addr}`
    })
    return balances
}

module.exports={
    arbitrum:{
        staking: staking("0x06b4dfabaf0fb0cf813526572cc86b2695c9d050", "0xdb96f8efd6865644993505318cc08ff9c42fb9ac", "arbitrum"),
        tvl
    }
}