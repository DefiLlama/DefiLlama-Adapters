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

// Satsuma DEX pools are already tracked in DefiLlama's uniswapV3 registry.
// This adapter only reports idle token balances held by the Satsuma ICHI vaults
// so it does not double-count active pool liquidity.
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
  // ICHI vault positions are backed by Algebra pool liquidity, which DefiLlama
  // already counts through registries/uniswapV3.js. We only add idle balances
  // held directly by the vault contracts.
  const owners = ICHI_CITREA_VAULTS;

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
  methodology: 'Satsuma Algebra pool liquidity is already tracked by DefiLlama’s uniswapV3 registry. This adapter adds only idle token balances held directly by Satsuma ICHI vault contracts on Citrea.',
  citrea: {
    tvl,
  },
  hallmarks: [
    // Add any significant events here
    // [timestamp, "Event description"],
  ],
};
