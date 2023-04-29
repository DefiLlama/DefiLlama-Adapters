const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const cUSDTokenAddress = ADDRESSES.celo.cUSD

const stakingContract = "0x8ea91a982d93836415CE3abbaf12d59fb8cE3Ff8"

async function tvl(timestamp, ethBlock, {celo: block}) {
    const chain = "celo"
    const balances = {}

    const stakedcUSD = await sdk.api.erc20.balanceOf({
      target: cUSDTokenAddress,
      owner: stakingContract,
      chain: chain,
      block: block
    })

    sdk.util.sumSingleBalance(balances, "celo-dollar", Number(stakedcUSD.output)/1e18)
    return balances;
}

module.exports={
    hallmarks: [
        [1656547200,"Token Purchase & Rewards claiming halt"]
    ],
    methodology: "Get all cUSD that the staking contract for Talent Protocol holds",
    celo: {
        tvl
    }
}
