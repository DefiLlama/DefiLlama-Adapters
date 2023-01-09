const abi = require("./abi.json");
const sdk = require('@defillama/sdk');


const REGISTRY_ADDR = "0xD6E9D27C75Afd88ad24Cd5EdccdC76fd2fc3A751"

const chain = 'ethereum'
async function tvl(timestamp, block, chainBlocks) {    

const { output: pairs } = await sdk.api.abi.call({
    target: REGISTRY_ADDR,
    abi: abi['getAllPairAddresses'],
    })      

  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.collateralContract,
    calls: pairs.map(i => ({ target: i })),
    chain, block,
  })

  const { output: camounts } = await sdk.api.abi.multiCall({
    abi: abi.totalCollateral,
    calls: pairs.map(i => ({ target: i })),
    chain, block,
  })

  const balances = {}
  tokens.forEach((res, i)=>{
    sdk.util.sumSingleBalance(balances, res.output, camounts[i].output)
  })

 return balances
}

module.exports = {
  timetravel: true,
  methodology: 'Gets the pairs from the REGISTRY_ADDRESS and adds the collateral amounts from each pair',
  misrepresentedTokens: false,
  ethereum: {
    tvl
  },
}