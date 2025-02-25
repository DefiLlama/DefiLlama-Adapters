const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const XAI = '0xd7c9f0e536dc865ae858b0c0453fe76d13c3beac'
const blacklistedSilos = ["0x6543ee07cf5dd7ad17aeecf22ba75860ef3bbaaa",];

const getAssetsAbiV1 = "address[]:getAssets"
const getAssetStateAbiV1 = 'function getAssetsWithState() view returns (address[] assets, tuple(address collateralToken, address collateralOnlyToken, address debtToken, uint256 totalDeposits, uint256 collateralOnlyDeposits, uint256 totalBorrowAmount)[] assetsStorage)'

const configV1 = {
  ethereum: {
    factories: [
      {
        START_BLOCK: 15307294,
        SILO_FACTORY: '0x4D919CEcfD4793c0D47866C8d0a02a0950737589', // Silo Ethereum (Legacy)
      },
      {
        START_BLOCK: 17391885,
        SILO_FACTORY: '0x6d4A256695586F61b77B09bc3D28333A91114d5a' // Silo Ethereum (Convex Factory)
      },
      {
        START_BLOCK: 17782576,
        SILO_FACTORY: '0x2c0fA05281730EFd3ef71172d8992500B36b56eA' // Silo Ethereum (LLAMA Edition)
      },
      {
        START_BLOCK: 20367992,
        SILO_FACTORY: '0xB7d391192080674281bAAB8B3083154a5f64cd0a', // Silo Ethereum (Main)
      }
    ]
  },
  arbitrum: {
    factories: [
      {
        START_BLOCK: 51894508,
        SILO_FACTORY: '0x4166487056A922D784b073d4d928a516B074b719', // Silo Arbitrum (Main)
      }
    ]
  },
  optimism: {
    factories: [
      {
        START_BLOCK: 120480601,
        SILO_FACTORY: '0x6B14c4450a29Dd9562c20259eBFF67a577b540b9', // Silo Optimism (Main)
      }
    ]
  },
  base: {
    factories: [
      {
        START_BLOCK: 16262586,
        SILO_FACTORY: '0x408822E4E8682413666809b0655161093cd36f2b', // Silo Base (Main)
      }
    ]
  },
}

async function tvl(api) {
  // Handle V1 silos
  let toaV1 = [];
  if(configV1[api.chain]) {
    const siloArray = await getSilosV1(api);
    const assets = await api.multiCall({
      abi: getAssetsAbiV1,
      calls: siloArray,
    });
    toaV1 = assets.map((v, i) => ([v, siloArray[i]]));
  }

  return sumTokens2({ api, ownerTokens: toaV1, blacklistedTokens: [XAI], });
}

async function borrowed(api) {
  // Handle V1 silos
  if(configV1[api.chain]) {
    const siloArray = await getSilosV1(api);
    const assetStates = await api.multiCall({
      abi: getAssetStateAbiV1,
      calls: siloArray.map(i => ({ target: i })),
    });
    assetStates.forEach(({ assets, assetsStorage }) => {
      assetsStorage
        .forEach((i, j) => {
          if (assets[j].toLowerCase() === XAI) return;
          return api.add(assets[j], i.totalBorrowAmount)
        })
    })
  }
}

async function getSilosV1(api) {
  const chain = api.chain
  let logs = [];
  for(let factory of configV1[chain].factories) {
    const { SILO_FACTORY, START_BLOCK, } = factory;
    let logChunk = await getLogs({
      api,
      target: SILO_FACTORY,
      fromBlock: START_BLOCK,
      topic: 'NewSiloCreated(address,address,uint128)',
    })
    logs = [...logs, ...logChunk];
  }

  return logs.map((log) => `0x${log.topics[1].substring(26)}`).filter((address) => blacklistedSilos.indexOf(address.toLowerCase()) === -1);
}


module.exports = {
  methodology: `We calculate TVL by interacting with Silo Factory smart contracts on Ethereum, Arbitrum, Base & Optimism. For Ethereum, it queries (Main-V1)(0xB7d391192080674281bAAB8B3083154a5f64cd0a), (Legacy-V1)(0x4D919CEcfD4793c0D47866C8d0a02a0950737589), (Convex Factory-V1)(0x6d4A256695586F61b77B09bc3D28333A91114d5a), and (LLAMA Edition-V1)(0x2c0fA05281730EFd3ef71172d8992500B36b56eA). On Arbitrum, we query the Silo Arbitrum factory (Main-V1)(0x4166487056A922D784b073d4d928a516B074b719), On Optimism, we query the Silo Optimism factory (Main-V1)(0x6B14c4450a29Dd9562c20259eBFF67a577b540b9), On Base, we query the Silo Base factory (Main-V1)(0x408822E4E8682413666809b0655161093cd36f2b), we query the  to obtain the addresses of Silos, retrieve the assets of each Silo, and then calculates the sum of the deposited tokens, borrowed amount are exported separately.`,
  ethereum: { tvl, borrowed, },
  arbitrum: { tvl, borrowed, },
  optimism: { tvl, borrowed, },
  base: { tvl, borrowed, },
  sonic: { tvl, borrowed, },
  hallmarks: [
    [1692968400, "Launch CRV market"],
    [1736978400, "Launch Silo V2"],
  ]
}