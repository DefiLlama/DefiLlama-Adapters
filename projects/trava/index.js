const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const bscFactoryRegistryContract = "0xD11fba861283174CBCb1FD0a475e420aa955bE61"

async function getAddressesProviderFactorContract(block, chain, factoryRegistryContract) {
    const addressesProviderFactoryContract = (await sdk.api.abi.call({
        target: factoryRegistryContract,
        abi: abi["getAddressesProviderFactory"],
        block,
        chain

    })).output
    return addressesProviderFactoryContract
}

async function getAllPools(block, chain, addressesProviderFactoryContract) {
    let allPoolsContract = []
    const pools_addresses_provider_id = (await sdk.api.abi.call({
        target: addressesProviderFactoryContract,
        abi: abi["getAllPools"],
        block: block,
        chain: chain

    })).output

    for (provider_id of pools_addresses_provider_id) {
        let lendingPoolAddress = (await sdk.api.abi.call({
            target: addressesProviderFactoryContract,
            abi: abi["getLendingPool"],
            block: block,
            params: provider_id,
            chain: chain

        })).output
        allPoolsContract.push(lendingPoolAddress)
    }
    return allPoolsContract
}

async function getReserveData(block, chain, allPools) {
    let tTokenList = []
    let reserveList = []
    for (pool of allPools) {
        let poolReserveList = (await sdk.api.abi.call({
            target: pool,
            abi: abi["getReservesList"],
            block: block,
            chain: chain

        })).output
        for (reserve of poolReserveList) {
            let reserveData = (await sdk.api.abi.call({
                target: pool,
                abi: abi["getReserveData"],
                params: reserve,
                block: block,
                chain: chain

            })).output
            tToken = reserveData[6]
            reserveList.push(reserve)
            tTokenList.push(tToken)
        }
    }
    return [reserveList, tTokenList]
}

async function getSupply(block, chain, reserveList, tTokenList){
    let supply ={}
    for (let i=0; i < reserveList.length; i++ ){
        let tokenSupply = (await sdk.api.abi.call({
            target: tTokenList[i],
            abi: abi["totalSupply"],
            block: block,
            chain: chain
        })).output
        if (reserveList[i] == "0xfb6115445Bff7b52FeB98650C87f44907E58f802"){
            // aave dont have bsc address on coingecko
            supply["0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9"] = tokenSupply
        }else{
            supply["bsc:"+reserveList[i]] = tokenSupply
        }
    }
    return supply
}

async function bsc(timestamp, ethblock, chainBlocks){
    let block = chainBlocks.bsc
    let addressesProviderFactoryContract = await getAddressesProviderFactorContract(block, "bsc", bscFactoryRegistryContract)
    let allPools = await getAllPools(block, "bsc", addressesProviderFactoryContract)
    let [reserveList, tTokens] = await getReserveData(block, "bsc", allPools)
    let response = await getSupply(block, "bsc", reserveList, tTokens)
    return response

}

module.exports = {
    bsc: {
        tvl: bsc
    },
    tvl: sdk.util.sumChainTvls([bsc])
}