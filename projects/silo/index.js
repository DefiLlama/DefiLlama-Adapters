const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
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

const START_BLOCK = 15307294
const SILO_FACTORY = '0x4D919CEcfD4793c0D47866C8d0a02a0950737589'

async function tvl(_, block) {

  const siloArray = await getSilos(block)
  const { output: assets } = await sdk.api.abi.multiCall({
    abi: getAssetsAbi,
    calls: siloArray.map(i => ({ target: i})),
    block,
  })

  const toa = assets.map(i => i.output.map(j => [j, i.input.target])).flat()
  return sumTokens2({ block, tokensAndOwners: toa, })
}

async function borrowed(_, block) {
  const balances = {}
  const siloArray = await getSilos(block)
  const { output: assetStates } = await sdk.api.abi.multiCall({
    abi: getAssetStateAbi,
    calls: siloArray.map(i => ({ target: i})),
    block,
  });
  assetStates.forEach(({ output: { assets, assetsStorage}}) => {
    assetsStorage.forEach((i, j) => sdk.util.sumSingleBalance(balances, assets[j], i.totalBorrowAmount))
  })

  return balances
}

let silos

async function getSilos(block) {
  if (!silos) silos = _getSilos()
  return silos

  async function _getSilos() {
    const logs = (
      await sdk.api.util.getLogs({
        keys: [],
        toBlock: block,
        target: SILO_FACTORY,
        fromBlock: START_BLOCK,
        topic: 'NewSiloCreated(address,address,uint128)',
      })
    ).output
  
    return logs.map((log) => `0x${log.topics[1].substring(26)}`)
  }
}


module.exports = {
  ethereum: { tvl, borrowed, },
  hallmarks: [
    [1668816000, "XAI Genesis"]
  ]
}