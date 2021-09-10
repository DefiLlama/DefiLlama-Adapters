const {fetchURL} = require('../helper/utils')

// Pool with all the coins is on https://finder.terra.money/columbus-4/address/terra1z5j60wct88yz62ylqa4t8p8239cwx9kjlghkg2 but idk how to unwrap aUST into UST so we're using the api instead
async function tvl(){
    const pools = await fetchURL("https://api.pylon.money/api/launchpad/v1/projects/mine/")

    return {
        'terrausd': pools.data.project.pools.reduce((t,p)=>t+p.totalDepositsInUst, 0)
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