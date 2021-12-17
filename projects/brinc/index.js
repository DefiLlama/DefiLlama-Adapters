const { stakingPricedLP } = require('../helper/staking')
const {sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')



const treasury = "0x7BFf1FC001054c4FfFF4E9117415112E07212A4E"

async function tvl(time, ethBlock){
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [
        ["0x6b175474e89094c44da98b954eedeac495271d0f", false], //dai
        
    ], [treasury], ethBlock, "ethereum")
    return balances
}

module.exports={
    methodology: `DAI reserves in the bonding curve `,
    ethereum:{
        tvl,
        //staking: stakingPricedLP("0xE5Df6583eE8DAe9F532e65D7D2C30A961c442f8a", "0x5fE5E1d5D86BDD4a7D84B4cAfac1E599c180488f", "ethereum", "0xe4f157c7ca54f435fcc3bb0b4452f98d3a48f303", "dai", true )
    }
}