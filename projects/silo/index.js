const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const XAI = '0xd7c9f0e536dc865ae858b0c0453fe76d13c3beac'
const blacklistedSilos = ["0x6543ee07cf5dd7ad17aeecf22ba75860ef3bbaaa",];

const getAssetsAbiV1 = "address[]:getAssets"
const getAssetStateAbiV1 = 'function getAssetsWithState() view returns (address[] assets, tuple(address collateralToken, address collateralOnlyToken, address debtToken, uint256 totalDeposits, uint256 collateralOnlyDeposits, uint256 totalBorrowAmount)[] assetsStorage)'

const getAssetAbiV2 = "address:asset"
const getAssetStateAbiV2 = 'function getTotalAssetsStorage(uint8 _assetType) external view returns (uint256 totalAssetsByType)';

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

const configV2 = {
  sonic: {
    factories: [
      {
        START_BLOCK: 2672166,
        SILO_FACTORY: '0xa42001d6d2237d2c74108fe360403c4b796b7170', // Silo V2 Sonic (Main)
      }
    ]
  },
  arbitrum: {
    factories: [
      {
        START_BLOCK: 291201890,
        SILO_FACTORY: '0xf7dc975C96B434D436b9bF45E7a45c95F0521442', // Silo V2 Arbitrum (Main)
      }
    ]
  }
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

  // Handle V2 silos
  let toaV2 = [];
  if(configV2[api.chain]) {
    const siloArrayV2 = await getSilosV2(api);
    const assetsV2 = await api.multiCall({
      abi: getAssetAbiV2,
      calls: siloArrayV2.map(i => ({ target: i })),
    });
    toaV2 = assetsV2.map((asset, i) => [[asset], siloArrayV2[i]]);
  }

  // Combine V1 and V2 owner-token pairs
  const toa = [...toaV1, ...toaV2];

  return sumTokens2({ api, ownerTokens: toa, blacklistedTokens: [XAI], });
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

  if(configV2[api.chain]) {
    // Handle V2 silos
    const siloArrayV2 = await getSilosV2(api);
    
    // Get asset address for each silo
    const siloAssets = await api.multiCall({
      abi: getAssetAbiV2,
      calls: siloArrayV2.map(i => ({ target: i })),
    });

    // Get total borrow amount for each silo (AssetType.DEBT = 2)
    const borrowAmounts = await api.multiCall({
      abi: getAssetStateAbiV2,
      calls: siloArrayV2.map(i => ({ target: i, params: [2] })),
    });

    // Add borrow amounts for V2 silos
    siloAssets.forEach((asset, index) => {
      if (asset.toLowerCase() === XAI) return;
      return api.add(asset, borrowAmounts[index])
    });
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

async function getSilosV2(api) {
  const chain = api.chain;
  let logs = [];
  let siloAddresses = [];
  if(configV2[chain]) {
    for(let factory of configV2[chain].factories) {
      const { SILO_FACTORY, START_BLOCK } = factory;
      let logChunk = await getLogs({
        api,
        target: SILO_FACTORY,
        fromBlock: START_BLOCK,
        eventAbi: 'event NewSilo(address indexed implementation, address indexed token0, address indexed token1, address silo0, address silo1, address siloConfig)',
      });
      logs = [...logs, ...logChunk];
    }

    siloAddresses = logs.flatMap((log) => {

      let silo0 = log.args[3];
      let silo1 = log.args[4];

      return [silo0, silo1].filter(
        (address) => blacklistedSilos.indexOf(address.toLowerCase()) === -1
      );
    });

  }

  return siloAddresses;
}


module.exports = {
  methodology: `We calculate TVL by interacting with Silo Factory smart contracts on Ethereum, Arbitrum, Base & Optimism. For Ethereum, it queries Silo(Main-V2)(0xa42001d6d2237d2c74108fe360403c4b796b7170), (Main-V1)(0xB7d391192080674281bAAB8B3083154a5f64cd0a), (Legacy-V1)(0x4D919CEcfD4793c0D47866C8d0a02a0950737589), (Convex Factory-V1)(0x6d4A256695586F61b77B09bc3D28333A91114d5a), and (LLAMA Edition-V1)(0x2c0fA05281730EFd3ef71172d8992500B36b56eA). On Arbitrum, we query the Silo Arbitrum factories (Main-V2)(0xf7dc975C96B434D436b9bF45E7a45c95F0521442) & (Main-V1)(0x4166487056A922D784b073d4d928a516B074b719), On Optimism, we query the Silo Optimism factory (Main-V1)(0x6B14c4450a29Dd9562c20259eBFF67a577b540b9), On Base, we query the Silo Base factory (Main-V1)(0x408822E4E8682413666809b0655161093cd36f2b), we query the  to obtain the addresses of Silos, retrieve the assets of each Silo, and then calculates the sum of the deposited tokens, borrowed amount are exported separately.`,
  ethereum: { tvl, borrowed, },
  arbitrum: { tvl, borrowed, },
  optimism: { tvl, borrowed, },
  base: { tvl, borrowed, },
  sonic: { tvl, borrowed, },
  hallmarks: [
    [1692968400, "Launch CRV market"]
  ]
}