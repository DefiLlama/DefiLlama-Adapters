const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/utils')

const bondFactory = '0x1533eb8c6cc510863b496d182596ab0e9e77a00c'

async function tvl(timestamp, block, chainBlocks) {
  
  const logs = await getLogs({
    fromBlock: 15785514,
    timestamp, 
    chainBlocks,
    topic: 'BondCreated(address,string,string,address,uint256,address,address,uint256,uint256,uint256)',
    eventInterface: 'event BondCreated (address newBond, string name, string symbol, address owner, uint256 maturity, address paymentToken, address collateralToken, uint256 collateralTokenAmount, uint256 convertibleTokenAmount, uint256 bonds)',
    target: bondFactory,
  })
  const toa = logs.map(i => ([i.topics[3], i.newBond]))
  return sumTokens2({ block, tokensAndOwners: toa, })
}

module.exports = {
  methodology: "Sum the collateral value of active Arbor Finance bonds.",
  start: 14906553,
  ethereum: {
    tvl,
  },
};
