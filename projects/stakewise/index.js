const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(api) {
  const lsBals = await api.multiCall({  abi: 'erc20:totalSupply', calls: ['0x20BC832ca081b91433ff6c17f85701B6e92486c5', '0xFe2e637202056d30016725477c5da089Ab0A043A']})

  const solosValidators = await getLogs({
    target: '0xEadCBA8BF9ACA93F627F31fB05470F5A0686CEca',
    topic: 'ValidatorRegistered(bytes32,bytes,uint256,address)',
    fromBlock: 11726299,
    api
  })
  lsBals.push(solosValidators.length * 32e18)
  const vaults = await getLogs({
    target: '0x3a0008a588772446f6e656133c2d5029cc4fc20e',
    topic: 'VaultAdded(address,address)',
    fromBlock: 18470078,
    api
  })
  const assets = await api.multiCall({
    calls: vaults.map(v=>({target:"0x"+v.topics[2].slice(26)})),
    abi: "uint256:totalAssets"
  })

  api.add(ADDRESSES.ethereum.WETH, assets.concat(lsBals))
}

async function xdaiTvl(timestamp, ethBlock, { xdai: block }) {
  const chain = "xdai"
  const supply = await sdk.api.erc20.totalSupply({
    target: '0xA4eF9Da5BA71Cc0D2e5E877a910A37eC43420445',
    block,
    chain
  })

  return {
    [ADDRESSES.ethereum.GNO]: supply.output
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
