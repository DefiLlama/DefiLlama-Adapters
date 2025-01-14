const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

const CONFIG = {
  ethereum: {
    rETH2: '0x20BC832ca081b91433ff6c17f85701B6e92486c5',
    sETH2: '0xFe2e637202056d30016725477c5da089Ab0A043A',
    validator: '0xEadCBA8BF9ACA93F627F31fB05470F5A0686CEca',
    factory: '0x3a0008a588772446f6e656133c2d5029cc4fc20e',
    blacklist: ['0x09e84205df7c68907e619d07afd90143c5763605']
  },
  xdai: {
    GNO: ADDRESSES.xdai.GNO,
    sGNO: '0xA4eF9Da5BA71Cc0D2e5E877a910A37eC43420445'
  }
}

const topic = {
  validatorRegistered: 'ValidatorRegistered(bytes32,bytes,uint256,address)',
  vaultAdded: 'VaultAdded(address,address)'
}

const ethTvl = async (api) => {
  const { rETH2, sETH2, validator, factory, blacklist } = CONFIG[api.chain]
  const lsBals = await api.multiCall({ abi: 'erc20:totalSupply', calls: [rETH2, sETH2]})
  const solosValidators = await getLogs({ api, target: validator, topic: topic.validatorRegistered, fromBlock: 11726299 })
  lsBals.push(solosValidators.length * 32e18)
  const vaults = await getLogs({ api, target: factory, topic: topic.vaultAdded, fromBlock: 18470078 })

  const assets = await api.multiCall({
    calls: vaults
      .map(v => ({ target: "0x" + v.topics[2].slice(26) }))
      .filter(call => !blacklist.includes(call.target.toLowerCase())),
    abi: "uint256:totalAssets"
  })

  api.add(ADDRESSES.ethereum.WETH, assets.concat(lsBals))
}

const xdaiTvl = async (api) => {
  const { GNO, sGNO } = CONFIG[api.chain]
  const supply = await api.call({ target: sGNO, abi: 'erc20:totalSupply' })
  api.add(GNO, supply)
}

module.exports = {
  methodology: 'Counts ETH staked',
  ethereum: { tvl: ethTvl },
  xdai: { tvl: xdaiTvl }
}