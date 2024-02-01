const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const abi = require('./abi.json');

const bscFactoryRegistryContract = "0xD11fba861283174CBCb1FD0a475e420aa955bE61"
const fantomFactoryRegistryContract = "0xbb6d1ba6089309b09fb5e81ff37309c1a086b74a"

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

    for (const provider_id of pools_addresses_provider_id) {
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
    for (const pool of allPools) {
        const poolReserveList = (await sdk.api.abi.call({
            target: pool,
            abi: abi["getReservesList"],
            block: block,
            chain: chain

        })).output
        for (const reserve of poolReserveList) {
            const reserveData = (await sdk.api.abi.call({
                target: pool,
                abi: abi["getReserveData"],
                params: reserve,
                block: block,
                chain: chain

            })).output
            const tToken = reserveData[6]
            const debtToken = reserveData[7]
            tTokenList.push({
                tToken,
                debtToken,
                reserve
            })
        }
    }
    return tTokenList
}

async function getTVL(block, chain, tTokenList) {
    let tvl = {}
    for (let i = 0; i < tTokenList.length; i++) {
        let tokenSupply = (await sdk.api.abi.call({
            target: tTokenList[i].tToken,
            abi: abi["totalSupply"],
            block: block,
            chain: chain
        })).output
        let tokenBorrow = (await sdk.api.abi.call({
            target: tTokenList[i].debtToken,
            abi: abi["totalSupply"],
            block: block,
            chain: chain
        })).output
        let addressToAdd;
        if (tTokenList[i].reserve == "0xfb6115445Bff7b52FeB98650C87f44907E58f802" && chain == "bsc") {
            // aave dont have bsc address on coingecko
            addressToAdd = ADDRESSES.ethereum.AAVE
        } else if (tTokenList[i].reserve == ADDRESSES.fantom.DAI && chain == "fantom"){
            addressToAdd = ADDRESSES.ethereum.DAI
        } else if (tTokenList[i].reserve == ADDRESSES.fantom.fUSDT && chain == "fantom"){
            addressToAdd = ADDRESSES.ethereum.USDT
        }
        else {
            addressToAdd = chain + ":" + tTokenList[i].reserve
        }
        sdk.util.sumSingleBalance(tvl, addressToAdd,  BigNumber(tokenSupply).minus(tokenBorrow).toFixed(0))
    }
    return tvl
}

async function bsc(timestamp, ethblock, chainBlocks) {
    let block = chainBlocks.bsc
    let addressesProviderFactoryContract = await getAddressesProviderFactorContract(block, "bsc", bscFactoryRegistryContract)
    let allPools = await getAllPools(block, "bsc", addressesProviderFactoryContract)
    let tTokens = await getReserveData(block, "bsc", allPools)
    let response = await getTVL(block, "bsc", tTokens)
    return response

}

async function fantom(timestamp, ethblock, chainBlocks) {
    let block = chainBlocks.fantom
    let addressesProviderFactoryContract = await getAddressesProviderFactorContract(block, "fantom", fantomFactoryRegistryContract)
    let allPools = await getAllPools(block, "fantom", addressesProviderFactoryContract)
    let tTokens = await getReserveData(block, "fantom", allPools)
    let response = await getTVL(block, "fantom", tTokens)
    return response

}


module.exports = {
    methodology: 'Total supply in lending pools, not couting borrowed amount.',
    bsc: {
        tvl: bsc
    },
    fantom: {
        tvl: fantom
    },
}
