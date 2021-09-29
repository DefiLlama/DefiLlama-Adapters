const {fetchURL} = require('../helper/utils')

// Pools in https://gateway.pylon.money/
async function tvl(){
    const staked = await fetchURL(stakedEnpoint)

    return {
        'terrausd': staked.data.totalValueLockedUST - staked.data.liquidityInfo.ustReserve 
    }
}

const stakedEnpoint = "https://api.pylon.money/api/mine/v1/overview"
async function pool2(){
    const staked = await fetchURL(stakedEnpoint)

    return {
        "pylon-protocol": staked.data.liquidityInfo.tokenReserve,
        "terrausd":  staked.data.liquidityInfo.ustReserve,
    }
}

async function staking(){
    const staked = await fetchURL(stakedEnpoint)

    return {
        "pylon-protocol": staked.data.totalStaked,
    }
}

module.exports = {
    methodology: 'TVL counts the UST that has been deposted to the Protocol. Data is pulled from the Pylon API:"https://api.pylon.money/api/launchpad/v1/projects/mine".',
    historical: false,
    pool2:{
        tvl: pool2
    },
    staking:{
        tvl: staking
    },
    tvl
}