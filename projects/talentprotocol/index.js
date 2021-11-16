const {getBlock} = require('../helper/getBlock')
const sdk = require('@defillama/sdk')

const cUSDTokenAddress = "0x765DE816845861e75A25fCA122bb6898B8B1282a"

const stakingContract = "0x8ea91a982d93836415CE3abbaf12d59fb8cE3Ff8"

async function tvl(timestamp, ethBlock, chainBlocks) {
    const chain = "celo"
    const balances = {}
    const block = await getBlock(timestamp, chain, chainBlocks, true);

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
    methodology: "Get all cUSD that the staking contract for Talent Protocol holds",
    celo: {
        tvl
    }
}
