const { sumTokensAndLPsSharedOwners, sumLPWithOnlyOneTokenOtherThanKnown } = require("../helper/unwrapLPs");
const { stakingUnknownPricedLP } = require("../helper/staking");
const sdk = require('@defillama/sdk')

const transform = addr=>`avax:${addr}`
const chain = "avax"

const wMEMO = "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b"
const time = "avax:0xb54f16fb19478766a268f172c9480f8da1a7c9c3"
const treasuryAddress = "0x10C12B7322Ac2c5a26bD9929ABc6e6b7997570ba";
const joeLP = "0x7bc2561d69b56fae9760df394a9fa9202c5f1f11"
const treasuryTokens = [
    // gOHM
    ["0x321E7092a180BB43555132ec53AaA65a5bF84251", false],
    // Joe LP
    [joeLP, true],
    //wMEMO
    [wMEMO, false]
]
const stakingToken = "0xAA2439DBAd718c9329a5893A51a708C015F76346"

async function tvl(timestamp, ethBlock, chainBlocks) {
    const block = chainBlocks[chain]
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, treasuryTokens.filter(t => t[1] === false), [treasuryAddress], block, chain, transform)
    await Promise.all(treasuryTokens.filter(t => t[1] === true).map(t =>
        sumLPWithOnlyOneTokenOtherThanKnown(balances, t[0], treasuryAddress, stakingToken, block, chain, transform)
    ))
    const wmemoAddress = transform(wMEMO)
    const memo = await sdk.api.abi.call({
        target: wMEMO,
        abi:{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"wMEMOToMEMO","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        chain,
        block: chainBlocks.avax,
        params: [balances[wmemoAddress]]
    })
    balances[time] = memo.output
    delete balances[wmemoAddress]
    return balances
}

module.exports={
    avalanche:{
        tvl,
        staking: stakingUnknownPricedLP("0x50971d6B5a3CCd79C516f914208C67C8104977dF", stakingToken, chain, joeLP, transform)
    }
}