const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const cUSDTokenAddress = ADDRESSES.celo.cUSD
const stakingContract = "0x8ea91a982d93836415CE3abbaf12d59fb8cE3Ff8"

module.exports={
    hallmarks: [
        [1656547200,"Token Purchase & Rewards claiming halt"]
    ],
    deadFrom: 1656547200,
    methodology: "Get all cUSD that the staking contract for Talent Protocol holds",
    celo: {
        tvl: sumTokensExport({ tokensAndOwners: [[cUSDTokenAddress, stakingContract]] }),
    }
}
