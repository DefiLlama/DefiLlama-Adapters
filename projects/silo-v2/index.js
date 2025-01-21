const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const XAI = '0xd7c9f0e536dc865ae858b0c0453fe76d13c3beac'
const blacklistedSilos = ["0x6543ee07cf5dd7ad17aeecf22ba75860ef3bbaaa",];

const getAssetAbiV2 = "address:asset";
const getAssetStateAbiV2 = 'function getTotalAssetsStorage(uint8 _assetType) external view returns (uint256 totalAssetsByType)';

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

  return sumTokens2({ api, ownerTokens: toaV2, blacklistedTokens: [XAI], });
}

async function borrowed(api) {
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
  methodology: `We calculate TVL by interacting with Silo Factory smart contracts on Ethereum, Arbitrum, Base & Optimism. For Ethereum, it queries Silo(Main-V2)(0xa42001d6d2237d2c74108fe360403c4b796b7170). On Arbitrum, we query the Silo Arbitrum factory (Main-V2)(0xf7dc975C96B434D436b9bF45E7a45c95F0521442), we query the factories to obtain the addresses of Silos, retrieve the assets of each Silo, and then calculate the sum of the deposited tokens, borrowed amounts are calculated separately from TVL.`,
  // ethereum: { tvl, borrowed, },
  arbitrum: { tvl, borrowed, },
  // optimism: { tvl, borrowed, },
  // base: { tvl, borrowed, },
  sonic: { tvl, borrowed, },
  hallmarks: []
}