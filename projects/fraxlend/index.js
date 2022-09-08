const abi = require("./abi.json");
const sdk = require('@defillama/sdk');


const DEPLOYER_ADDR = "0x5d6e79bcf90140585ce88c7119b7e43caaa67044"

const chain = 'ethereum'
async function tvl(timestamp, block, chainBlocks) {    

const { output: pairs } = await sdk.api.abi.call({
    target: DEPLOYER_ADDR,
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
  methodology: 'Gets the pairs from the DEPLOYER_ADDRESS and adds the collateral amounts from each pair',
  misrepresentedTokens: false,
  ethereum: {
    tvl
  },
}