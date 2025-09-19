const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const XAI = '0xd7c9f0e536dc865ae858b0c0453fe76d13c3beac'
const blacklistedSilos = ["0x6543ee07cf5dd7ad17aeecf22ba75860ef3bbaaa",];

const getAssetAbiV2 = "address:asset";
const getAssetStateAbiV2 = 'function getTotalAssetsStorage(uint8 _assetType) external view returns (uint256 totalAssetsByType)';
const xSILO = '0x4451765739b2D7BCe5f8BC95Beaf966c45E1Dcc9';

const configV2 = {
  sonic: {
    factories: [
      {
        START_BLOCK: 2672166,
        SILO_FACTORY: '0xa42001d6d2237d2c74108fe360403c4b796b7170', // Silo V2 Sonic (Main)
      },
      {
        START_BLOCK: 25244110, // Silo V2 Sonic (Main Revised Deployment)
        SILO_FACTORY: '0x4e9dE3a64c911A37f7EB2fCb06D1e68c3cBe9203',
      }
    ],
  },
  arbitrum: {
    factories: [
      {
        START_BLOCK: 334531851,
        SILO_FACTORY: '0x384DC7759d35313F0b567D42bf2f611B285B657C', // Silo V2 Arbitrum (Main)
      }
    ]
  },
  ethereum: {
    factories: [
      {
        START_BLOCK: 22616413,
        SILO_FACTORY: '0x22a3cF6149bFa611bAFc89Fd721918EC3Cf7b581', // Silo V2 Ethereum (Main)
      }
    ]
  },
  avax: {
    factories: [
      {
        START_BLOCK: 64050356,
        SILO_FACTORY: '0x92cECB67Ed267FF98026F814D813fDF3054C6Ff9', // Silo V2 Avalanche (Main)
      }
    ]
  },
}

async function tvl(api) {
  // Handle V2 silos
  let toaV2 = [];
  const blacklistedTokens = configV2[api.chain]?.blacklistedTokens || [];
  if (configV2[api.chain]) {
    const siloArrayV2 = await getSilosV2(api);
    const assetsV2 = await api.multiCall({
      abi: getAssetAbiV2,
      calls: siloArrayV2.map(i => ({ target: i })),
    });
    toaV2 = assetsV2.map((asset, i) => [[asset], siloArrayV2[i]]);
  }

  return sumTokens2({ api, ownerTokens: toaV2, blacklistedTokens: [XAI].concat(blacklistedSilos), });
}

async function borrowed(api) {
  if (configV2[api.chain]) {
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
  if (configV2[chain]) {
    for (let factory of configV2[chain].factories) {
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

async function staking(api) {
  const stakedSilo = await api.call({
    target: xSILO,
    abi: 'function totalAssets() external view returns (uint256 total)',
  });
  return api.addCGToken('silo-finance-2', stakedSilo / 1e18)
}

module.exports = {
  methodology: `We calculate TVL by interacting with Silo Factory smart contracts on Ethereum, Arbitrum, Base & Optimism. For Ethereum, it queries Silo(Main-V2)(0xa42001d6d2237d2c74108fe360403c4b796b7170). On Arbitrum, we query the Silo Arbitrum factory (Main-V2)(0xf7dc975C96B434D436b9bF45E7a45c95F0521442), we query the factories to obtain the addresses of Silos, retrieve the assets of each Silo, and then calculate the sum of the deposited tokens, borrowed amounts are calculated separately from TVL.`,
  arbitrum: { tvl, borrowed, },
  ethereum: { tvl, borrowed, },
  // optimism: { tvl, borrowed, },
  // base: { tvl, borrowed, },
  sonic: { tvl, borrowed, staking},
  avax: { tvl, borrowed, },
  hallmarks: []
}