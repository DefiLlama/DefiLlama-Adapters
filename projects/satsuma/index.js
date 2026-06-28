/**
 * DefiLlama TVL Adapter for Satsuma DEX
 * 
 * To submit this adapter:
 * 1. Fork https://github.com/DefiLlama/DefiLlama-Adapters
 * 2. Create folder: projects/satsuma/
 * 3. Copy this file to: projects/satsuma/index.js
 * 4. Submit a Pull Request
 * 
 * Documentation: https://docs.llama.fi/list-your-project/how-to-write-an-sdk-adapter
 */

const { sumTokens2 } = require('../helper/unwrapLPs');

// Satsuma DEX on Citrea (Chain ID: 4114)
// Requires the Satsuma coins adapter (defillama-server coins-pr/satsumaCitrea.ts) so
// Citrea tokens are priced; without it TVL is ~$0. Pools/vaults: defillama-adapters/pools.js.
const SATSUMA_DEX_POOL_ADDRESSES = [
  '0xb22325fe6e033c6b7cefb7bc69c9650ffdc691f9',
  '0x78de0ada441a6bfe092967bb40ce30d7c77aad2c',
  '0x172d2ab563afdaace7247a6592ee1be62e791165',
  '0x5d4b518984ae9778479ee2ea782b9925bbf17080',
  '0x3560aa7a517b3e1fb6cddf225baf2febde3cb76c',
  '0xaea5cf09209631b6a3a69d5798034e2efdbe2cc8',
  '0x8f87f74d009e18b745fe6fb59d5859911a2c3db7',
  '0xa82eee40f1c88d773c93771d5b1fac61db311945',
  '0x28457e8dea5d0a136fb30079c6ee6f20bb3d52e0',
  '0xc9319c34e709e6e9156f22e7287af3a373b6547c',
  '0x42abc39798a5ce71bd8bd2a673dd17ada45977a5',
  '0x298a4e0ec1af98066b79836ea99dcc2dd5437f67',
  '0xea3fa2b0c8223b1367bdffcaa030e6a77c3c2ef0',
  '0x9ad930b091e6b7173ee85636067245b0ceddee63',
  '0x0557b48af1503d1a50f76a24938998a664fcf73f',
];

const ICHI_CITREA_VAULTS = [
  '0x8B759858f688A3e04411805f8954724f552b8061',
  '0x0b3E6074502301D4CF62F9748D38Ca781d95F944',
  '0xb5747c92D41540DFb7F04f6CbC739367fD25ED73',
  '0xA0DAc5c92d4537043FC989a730EF3247c6BfA7e8',
  '0x5f4164313912ef8ADFC569d90B15550228B43ba1',
  '0x3B13E09dEA65ab83644B44C50CfA75a06A589421',
  '0xe6cA7dEd0a0D5B07B40999E90f84f85B242441Dd',
  '0xb665ffd7422b89B7138cD58bDa244de97c27067e',
  '0xFb7ea62B5721eeCAF80D53bD05C9E61BD57A3352',
  '0xbd55166776c944A3f47B775d9727cE888e69a010',
  '0x87aC471B15EbFaB2Ab7F2Ac37434A95F914F8030',
  '0x2C667401846c5B8820e8C43bb04Fd39A6D92C54A',
  '0x5704c4116F3D34CB1b6a8559e20998D67030431d',
  '0xcAb47638478935A6FEac6B919Da6976db740D7d1',
  '0x5C8c7EF6095A3c756552A14d1c7A2fB05Ac28c09',
  '0x5A4785D8cA59b5e6B418a12f3E0da3Dc3DC65A31',
  '0xdB617d7dae5A4441582a5768e6f9dB999a3c8623',
  '0x4dfEA0f6a5D0E962eac721dA40FCEa65B6F6dA3c',
  '0x1762DB0Da35C4CB89A7ae257Ef823b4A9899FC4B',
  '0xcBebE1C9fbD823B8294a4BB02e894d56976fB759',
  '0x50A6Dc463a70633eDc961E2F0041403F2Ec55c9d',
  '0x5a534F98F38D28AD76dd710ddf432eDe9Fa95b3e',
];

async function tvl(api) {
  // Algebra liquidity is held by the pool contracts themselves, and ICHI vaults
  // hold their two underlying tokens directly. Both expose token0()/token1(),
  // so we resolve each holder's two tokens on-chain and sum the raw balances.
  const owners = [...SATSUMA_DEX_POOL_ADDRESSES, ...ICHI_CITREA_VAULTS];

  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: owners }),
    api.multiCall({ abi: 'address:token1', calls: owners }),
  ]);

  const tokensAndOwners = [];
  owners.forEach((owner, i) => {
    tokensAndOwners.push([token0s[i], owner]);
    tokensAndOwners.push([token1s[i], owner]);
  });

  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  methodology: 'TVL is calculated by summing token balances in Satsuma Algebra pools on Citrea plus idle balances held by Satsuma ICHI vaults. Token pricing is provided by the DefiLlama coins API.',
  citrea: {
    tvl,
  },
  hallmarks: [
    // Add any significant events here
    // [timestamp, "Event description"],
  ],
};
