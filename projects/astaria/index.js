const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  ethereum: { factory: '0x197Bb6Cd6cC9E9ABBFdaBff23DE7435c51d1B7BE', fromBlock: 16935232  , ACT: '0x455ad0f677628ed40e7397fb41818f474e0e5afe' },
}

/*
Object.keys(config).forEach(chain => {
  const { factory, fromBlock, ACT } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x9aa6282003aa425f2bb942f91daaf7080de24835fc4fa8f3f4dc52c7d014ea97'],
        eventAbi: 'event NewVault (address strategist, address delegate, address vault, uint8 vaultType)',
        onlyArgs: true,
        fromBlock,
      })
      const actLogs = await getLogs({
        api,
        target: ACT,
        topics: ['0xd6b6bfb15fe5be5c1a8af879e26df8c0e2470c4ad95a47a1397868b45910e853'],
        eventAbi: 'event Deposit721 (address indexed tokenContract, uint256 indexed tokenId, uint256 indexed collateralId, address depositedFor)',
        onlyArgs: true,
        fromBlock,
      })
      const vaults = logs.map(l => l.vault)
      const nfts = actLogs.map(l => l.tokenContract)
      const collIds = actLogs.map(l => l.collateralId)
      const clearingHouses = await api.multiCall({  abi: "function getClearingHouse(uint256 collateralId) view returns (address)", calls: collIds.map(i => i.toString()), target:ACT})
      const tokensAndOwners = nfts.map((v, i) => [v, clearingHouses[i]])

      const tokens = await api.multiCall({  abi: 'address:asset', calls: vaults})
      const bals = await api.multiCall({  abi: 'uint256:totalAssets', calls: vaults})
      tokens.forEach((t, i) => tokensAndOwners.push([t, vaults[i]]))
      return sumTokens2({ api, tokensAndOwners })
    }, 
    borrowed: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x9aa6282003aa425f2bb942f91daaf7080de24835fc4fa8f3f4dc52c7d014ea97'],
        eventAbi: 'event NewVault (address strategist, address delegate, address vault, uint8 vaultType)',
        onlyArgs: true,
        fromBlock,
      })
      const vaults = logs.map(l => l.vault)
      const tokens = await api.multiCall({  abi: 'address:asset', calls: vaults})
      const deposited = await api.multiCall({  abi: 'uint256:totalAssets', calls: vaults})
      const liquidity = await api.multiCall({  abi: 'erc20:balanceOf', calls: vaults.map((v, i) => ({ target: tokens[i], params: v }))})
      tokens.forEach((token, i) => api.add(token, deposited[i] - liquidity[i]))
    }, 
  }
})
*/

module.exports={
  ethereum:{
    tvl: ()=>({}),
    borrowed: ()=>({}),
  },
  hallmarks:[
    [1687301106, "White hack"]
  ]
}
