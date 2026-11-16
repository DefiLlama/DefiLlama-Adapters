const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

const CONFIG = {
  ethereum: {
    rETH2: '0x20BC832ca081b91433ff6c17f85701B6e92486c5',
    sETH2: '0xFe2e637202056d30016725477c5da089Ab0A043A',
    factory: '0x3a0008a588772446f6e656133c2d5029cc4fc20e',
    fromBlock: 18470078,
    blacklist: ['0x09e84205df7c68907e619d07afd90143c5763605']
  },
  xdai: {
    GNO: ADDRESSES.xdai.GNO,
    rGNO: '0x6aC78efae880282396a335CA2F79863A1e6831D4',
    sGNO: '0xA4eF9Da5BA71Cc0D2e5E877a910A37eC43420445',
    factory: '0x7d014B3C6ee446563d4e0cB6fBD8C3D0419867cB',
    fromBlock: 34778688,
    blacklist: []
  }
}

const topic = {
  vaultAdded: 'VaultAdded(address,address)'
}

// totalAssets of every V3 vault in the registry
const vaultAssets = async (api) => {
  const { factory, fromBlock, blacklist } = CONFIG[api.chain]
  const logs = await getLogs({ api, target: factory, topic: topic.vaultAdded, fromBlock })
  const vaults = logs
    .map(v => "0x" + v.topics[2].slice(26))
    .filter(vault => !blacklist.includes(vault.toLowerCase()))

  // meta vaults only hold shares of their sub-vaults, which are registry vaults and already counted
  const subVaultsRegistries = await api.multiCall({ calls: vaults, abi: 'address:subVaultsRegistry', permitFailure: true })
  const isMeta = (i) => subVaultsRegistries[i] && subVaultsRegistries[i] !== ADDRESSES.null
  return api.multiCall({ calls: vaults.filter((_, i) => !isMeta(i)), abi: "uint256:totalAssets" })
}

const ethTvl = async (api) => {
  // The v2 solo-staking registry is not counted: every validator ever registered through it
  // has exited the beacon chain, and each one's stake withdraws to the operator's own address
  // rather than to StakeWise, so none of it is held here.
  const { rETH2, sETH2 } = CONFIG[api.chain]
  const lsBals = await api.multiCall({ abi: 'erc20:totalSupply', calls: [rETH2, sETH2]})
  const assets = await vaultAssets(api)

  api.add(ADDRESSES.ethereum.WETH, assets.concat(lsBals))
}

const xdaiTvl = async (api) => {
  const { GNO, rGNO, sGNO } = CONFIG[api.chain]
  const lsBals = await api.multiCall({ abi: 'erc20:totalSupply', calls: [rGNO, sGNO] })
  const assets = await vaultAssets(api)
  api.add(GNO, assets.concat(lsBals))
}

module.exports = {
  methodology: 'Counts the ETH and GNO staked in StakeWise V3 vaults, plus the V2 rETH2/sETH2 and rGNO/sGNO supply. Meta vaults are skipped, since their assets sit in other vaults that are already counted.',
  ethereum: { tvl: ethTvl },
  xdai: { tvl: xdaiTvl }
}
