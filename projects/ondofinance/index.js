const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const oldAllPairVault = "0xeF970A111dd6c281C40Eee6c40b43f24435833c2"
const newAllPairVault = "0x2bb8de958134afd7543d4063cafad0b7c6de08bc"

function tvlForAllPair(allPairVault){
return async (timestamp, block) =>{
    const vaults = (await sdk.api.abi.call({
        target: allPairVault,
        block,
        abi: abi.getVaults,
        params:[0, 9999] // It cuts at max length
    })).output
    //console.log(util.inspect(vaults, false, null, true /* enable colors */))
    const balances = {}
    for(const vault of vaults){
        if(timestamp > Number(vault.startAt) && timestamp < Number(vault.redeemAt)){
            vault.assets.forEach(asset=>{
                sdk.util.sumSingleBalance(balances, asset.token, asset.deposited)
            })
        }
    }
    return balances
}
}

module.exports={
    methodology: "Counts all tokens resting on upcoming vaults and the ones deposited on active vaults",
    tvl: sdk.util.sumChainTvls([oldAllPairVault, newAllPairVault].map(tvlForAllPair))
}