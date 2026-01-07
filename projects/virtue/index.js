const iota = require('../helper/chain/iota')
const {getAllVaults} = require("./utils")

const COIN_TYPES= {
  IOTA: "0x2::iota::IOTA",
  stIOTA:
    "0x346778989a9f57480ec3fee15f2cd68409c73a62112d40a3efd13987997be68c::cert::CERT",
  VUSD: "0xd3b63e603a78786facf65ff22e79701f3e824881a12fa3268d62a75530fe904f::vusd::VUSD",
};

async function getStIOTARatio() {
    const nativePool = await iota.getObject('0x02d641d7b021b1cd7a2c361ac35b415ae8263be0641f9475ec32af4b9d8a8056');
    const stIOTAMetadata = await iota.getObject('0x8c25ec843c12fbfddc7e25d66869f8639e20021758cac1a3db0f6de3c9fda2ed');

    const stIOTATotalSupply = BigInt(stIOTAMetadata.fields.total_supply.fields.value) / BigInt(10 ** 9)
    const stIOTATotalStaked = BigInt(nativePool.fields.total_staked) / BigInt(10 ** 9)
    const stIOTATotalRewards = BigInt(nativePool.fields.total_rewards) / BigInt(10 ** 9)
    const tvl = stIOTATotalStaked + stIOTATotalRewards

    return Number(stIOTATotalSupply) / Number(tvl)    
}

async function tvl(api) {
    const vaults = await getAllVaults()
    const stIOTARatio = await getStIOTARatio()
    Object.values(vaults).forEach(async (vault)=>{
        const balanceAmount = Number(vault.collateralBalance)
        const symbol = vault.token
        if(symbol === 'IOTA'){
            api.add(COIN_TYPES['IOTA'], balanceAmount)
        }
        if(symbol === 'stIOTA'){
            api.add(COIN_TYPES['IOTA'], balanceAmount/stIOTARatio)
        }
        
    })
}


module.exports = {
    timetravel: false,
    iota: { 
        tvl,
    }
}