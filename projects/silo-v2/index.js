const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const XAI = '0xd7c9f0e536dc865ae858b0c0453fe76d13c3beac'
const blacklistedSilos = ["0x6543ee07cf5dd7ad17aeecf22ba75860ef3bbaaa",];

const badDebtSilos = {
  sonic: [
    "0xCCdDbBbd1E36a6EDA3a84CdCee2040A86225Ba71", // wmetaUSD - Sonic
    "0xEd9777944A2Fb32504a410D23f246463B3f40908", // USDC (wmetaUSD) - Sonic
    "0x6e8C150224D6e9B646889b96EFF6f7FD742e2C22", // wmetaUSD - Sonic
    "0x0aB02DD08c1555d1a20C76a6EA30e3E36f3e06d4", // scUSD (wmetaUSD) - Sonic
    "0x75c550776c191A8F6aE22EdC742aD2788723B66E", // wmetaUSD - Sonic
    "0xc6ee9A58D5270e53fD1361946899b6D0553142B4", // scUSD (wmetaUSD) - Sonic
    "0x501Ee3D6cB84004c7970cA24f3daC07D61A25e4D", // wmetaUSD - Sonic
    "0x1A089424F52502139888fa4c0ED2FA088e9E1d51", // USDC (wmetaUSD) - Sonic
    "0x1c1791911483E98875D162355feC47f37613f0FB", // wmetaS - Sonic
    "0x8c98b43BF61F2B07c4D26f85732217948Fca2a90", // wS (wmetaS) - Sonic
    "0xA1627a0E1d0ebcA9326D2219B84Df0c600bed4b1", // USDC - Sonic (Stream-impacted)
    "0xb1412442aa998950f2f652667d5Eba35fE66E43f", // scUSD - Sonic (Stream-impacted)
    "0x27968d36b937DcB26F33902fA489E5b228b104BE", // dUSD - Sonic (Stream-impacted)
    "0x76DF755A9f40463F14d0a2b7Cba3Ccf05404eEdf", // dUSD - Sonic (Stream-impacted)
    "0xAF1BDaE843d90c546DE5001f7b107B46e1a26Aa9", // dUSD - Sonic (Stream-impacted)
    "0x5954ce6671d97D24B782920ddCdBB4b1E63aB2De", // USDC - Sonic (Stream-impacted)
    "0x4935FaDB17df859667Cc4F7bfE6a8cB24f86F8d0", // USDC - Sonic (Stream-impacted)
    "0x219656F33c58488D09d518BaDF50AA8CdCAcA2Aa", // ETH - Sonic (Stream-impacted)
  ].map(entry => entry.toLowerCase()),
  ethereum: [
    "0x1dE3bA67Da79A81Bc0c3922689c98550e4bd9bc2", // USDC - ethereum (Stream-impacted)
  ].map(entry => entry.toLowerCase()),
  arbitrum: [
    "0xACb7432a4BB15402CE2afe0A7C9D5b738604F6F9", // USDC - Arbitrum (Stream-impacted)
    "0x2433D6AC11193b4695D9ca73530de93c538aD18a", // USDC - Arbitrum (Stream-impacted)
  ].map(entry => entry.toLowerCase()),
  avax: [
    "0x672b77f0538b53Dc117C9dDfEb7377A678d321a6", // USDC - Avalanche (Stream-impacted)
    "0xE0fc62e685E2b3183b4B88b1fE674cFEc55a63F7", // USDT - Avalanche (Stream-impacted)
    "0x9C4D4800b489d217724155399CD64D07Eae603f3", // AUSD - Avalanche (Stream-impacted)
    "0x7437ac81457Fa98fFB2d0C8f9943ecfE4813e2f1", // BTC.b - Avalanche (Stream-impacted)
  ].map(entry => entry.toLowerCase()),
};

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
        (address) => ((blacklistedSilos.indexOf(address.toLowerCase()) === -1) && (badDebtSilos[chain]?.indexOf(address.toLowerCase()) === -1))
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