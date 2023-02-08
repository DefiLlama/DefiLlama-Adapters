const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')
const getAssetsAbi = {
  "inputs": [],
  "name": "getAssets",
  "outputs": [
    {
      "internalType": "address[]",
      "name": "assets",
      "type": "address[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const getAssetStateAbi = {
  "inputs": [],
  "name": "getAssetsWithState",
  "outputs": [
    {
      "internalType": "address[]",
      "name": "assets",
      "type": "address[]"
    },
    {
      "components": [
        {
          "internalType": "contract IShareToken",
          "name": "collateralToken",
          "type": "address"
        },
        {
          "internalType": "contract IShareToken",
          "name": "collateralOnlyToken",
          "type": "address"
        },
        {
          "internalType": "contract IShareToken",
          "name": "debtToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "totalDeposits",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "collateralOnlyDeposits",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalBorrowAmount",
          "type": "uint256"
        }
      ],
      "internalType": "struct IBaseSilo.AssetStorage[]",
      "name": "assetsStorage",
      "type": "tuple[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const Networks = {
  ETHEREUM: 'ethereum',
  ARBITRUM: 'arbitrum',
}

const StartBlocks = {
  [Networks.ETHEREUM]: 15307294,
  [Networks.ARBITRUM]: 51894508,
}

const FactoryAddresses = {
  [Networks.ETHEREUM]: '0x4D919CEcfD4793c0D47866C8d0a02a0950737589',
  [Networks.ARBITRUM]: '0x4166487056A922D784b073d4d928a516B074b719',
}

const Silos = {
  [Networks.ETHEREUM]: null,
  [Networks.ARBITRUM]: null,
}

async function tvl(_, ethBlock, chainBlocks, { api }) {

  const siloArray = await getSilos(api, Networks.ETHEREUM)
  const { output: assets } = await sdk.api.abi.multiCall({
    abi: getAssetsAbi,
    calls: siloArray.map(i => ({ target: i})),
    block: ethBlock,
  })

  const toa = assets.map(i => i.output.map(j => [j, i.input.target])).flat()
  return sumTokens2({ block: ethBlock, tokensAndOwners: toa, })
}

async function borrowed(_, ethBlock, chainBlocks, { api }) {
  const balances = {}
  const siloArray = await getSilos(api, Networks.ETHEREUM)
  const { output: assetStates } = await sdk.api.abi.multiCall({
    abi: getAssetStateAbi,
    calls: siloArray.map(i => ({ target: i})),
    block: ethBlock,
  });
  assetStates.forEach(({ output: { assets, assetsStorage}}) => {
    assetsStorage.forEach((i, j) => sdk.util.sumSingleBalance(balances, assets[j], i.totalBorrowAmount))
  })

  return balances
}

async function tvlArbitrum(_, ethBlock, chainBlocks, { api }) {

  const siloArray = await getSilos(api, Networks.ARBITRUM);
  const { output: assets } = await sdk.api.abi.multiCall({
    abi: getAssetsAbi,
    calls: siloArray.map(i => ({ target: i})),
    block: chainBlocks[Networks.ARBITRUM],
    chain: Networks.ARBITRUM,
  })

  const toa = assets.map(i => i.output.map(j => [j, i.input.target])).flat()
  return sumTokens2({ block: chainBlocks[Networks.ARBITRUM], tokensAndOwners: toa, chain: Networks.ARBITRUM })
}

async function borrowedArbitrum(_, ethBlock, chainBlocks, { api }) {
  const balances = {}
  const siloArray = await getSilos(api, Networks.ARBITRUM)
  const { output: assetStates } = await sdk.api.abi.multiCall({
    abi: getAssetStateAbi,
    calls: siloArray.map(i => ({ target: i})),
    block: chainBlocks[Networks.ARBITRUM],
    chain: Networks.ARBITRUM,
  });

  assetStates.forEach(({ output: { assets, assetsStorage}}) => {
    assetsStorage.forEach((i, j) => sdk.util.sumSingleBalance(balances, assets[j], i.totalBorrowAmount, Networks.ARBITRUM))
  })

  return balances
}

async function getSilos(api, network) {
  if (!Silos[network]) Silos[network] = _getSilos(network)
  return Silos[network]

  async function _getSilos(network) {

    let useFactoryAddress = FactoryAddresses[network];
    let useStartBlock = StartBlocks[network];

    const logs = (
      await getLogs({
        api,
        target: useFactoryAddress,
        fromBlock: useStartBlock,
        topic: 'NewSiloCreated(address,address,uint128)',
      })
    )
  
    return logs.map((log) => `0x${log.topics[1].substring(26)}`)
  }
}


module.exports = {
  ethereum: { 
    tvl,
    borrowed,
  },
  arbitrum: {
    tvl: tvlArbitrum,
    borrowed: borrowedArbitrum,
  },
  hallmarks: [
    [1668816000, "XAI Genesis"]
  ]
}