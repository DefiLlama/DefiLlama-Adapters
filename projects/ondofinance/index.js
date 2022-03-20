const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs")

const oldAllPairVault = "0xeF970A111dd6c281C40Eee6c40b43f24435833c2"
const newAllPairVault = "0x2bb8de958134afd7543d4063cafad0b7c6de08bc"
const STABLE_PARTNER_VAULTS = [
    "0xBD9495E42ec4a2F5DF1370A6DA42Ec9a4656E963",
    "0xb230B535D2cf009Bdc9D7579782DE160b795d5E8",
    "0x7EBa8a9cAcb4bFbf7e1258b402A8e7aA004ED9FD",
]

const STABLE_PARTNER_TOKENS = [
    "0x4Eb8b4C65D8430647586cf44af4Bf23dEd2Bb794", // FRAX Price Index share,
    "0x36784d3B5aa8A807698475b3437a13fA20B7E9e1",  // Timeless
    "0x853d955aCEf822Db058eb8505911ED77F175b99e",  // Frax
    "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",  // FXS
    "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",  // FEI
    "0x0f2D719407FdBeFF09D87557AbB7232601FD9F29",  // Synapse
    "0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7",  // Gro
    "0x67B6D479c7bB412C54e03dCA8E1Bc6740ce6b99C",  // Kylin
    "0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e",  // Pool together
    "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",  // UMA
    "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",  // CVX
    "0x85F17Cf997934a597031b2E18a9aB6ebD4B9f6a4",  // Near
]

const transformAddresses = (addr) => {
    if (addr === "0x85F17Cf997934a597031b2E18a9aB6ebD4B9f6a4") return "near"
    return addr
}

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};

    await sumTokensAndLPsSharedOwners(
        balances,
        STABLE_PARTNER_TOKENS.map(i => [i, false]),
        STABLE_PARTNER_VAULTS,
        block,
        null,
        transformAddresses,
    );

    return balances;
}

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
    tvl: sdk.util.sumChainTvls([...[oldAllPairVault, newAllPairVault].map(tvlForAllPair), tvl,])
}