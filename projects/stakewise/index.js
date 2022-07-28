const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js')
const {getBlock} = require('../helper/getBlock')

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

async function tvl(timestamp, block) {
  const supply = await sdk.api.erc20.totalSupply({
    target: '0xFe2e637202056d30016725477c5da089Ab0A043A',
    block
  })

  const solosValidators = await sdk.api.util.getLogs({
    target: '0xEadCBA8BF9ACA93F627F31fB05470F5A0686CEca',
    topic: 'ValidatorRegistered(bytes32,bytes,uint256,address)',
    fromBlock: 0,
    toBlock: block,
    keys:[]
  })
  const ethOnValidators = BigNumber(solosValidators.output.length).times(32e18)

  return {
    [wethAddress]: ethOnValidators.plus(supply.output).toFixed(0)
  }
}

async function xdaiTvl(timestamp, ethBlock, chainBlocks) {
  const chain = "xdai"
  const block = await getBlock(timestamp, chain, chainBlocks)
  const supply = await sdk.api.erc20.totalSupply({
    target: '0xA4eF9Da5BA71Cc0D2e5E877a910A37eC43420445',
    block,
    chain
  })

  return {
    "0x6810e776880c02933d47db1b9fc05908e5386b96": supply.output
  }
}



module.exports = {
  methodology: 'Counts ETH staked',
  ethereum: {
    tvl,
  },
  xdai:{
    tvl: xdaiTvl
  }
}
