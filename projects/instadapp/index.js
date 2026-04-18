const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// Arbitrum contracts
const ARBITRUM_CONTRACTS = {
  index: '0x1eE00C305C51Ff3bE60162456A9B533C07cD9288',
  instaList: '0x3565F6057b7fFE36984779A507fC87b31EFb0f09',
  instaAccount: '0x857f3b524317C0C403EC40e01837F1B160F9E7Ab',
  instaConnectors: '0x67fCE99Dd6d8d659eea2a1ac1b8881c57eb6592B',
  instaMemory: '0xc109f7Ef06152c3a63dc7254fD861E612d3Ac571',
  implementations: '0xF3Bb2FbdCDa1B8B6d19f513D69462eA548d0eF12',
  instaFlashAggregator: '0x1f882522DF99820dF8e586b6df8bAae2b91a782d',
  instaFlashResolver: '0x33D8F735DD64ceC51d212616BCa5Ad9b7769CD34',
  treasury: '0xf81AB897E3940E95d749fF2e1F8D38f9b7cBe3cf',
};

// Polygon contracts
const POLYGON_CONTRACTS = {
  index: '0xA9B99766E6C676Cf1975c0D3166F96C0848fF5ad',
  instaList: '0x839c2D3aDe63DF5b0b8F3E57D5e145057Ab41556',
  instaAccount: '0x28846f4051EB05594B3fF9dE76b7B5bf00431155',
  instaConnectors: '0x2A00684bFAb9717C21271E0751BCcb7d2D763c88',
  instaMemory: '0x6C7256cf7C003dD85683339F75DdE9971f98f2FD',
  implementations: '0x39d3d5e7c11D61E072511485878dd84711c19d4A',
  instaFlashAggregator: '0xB2A7F20D10A006B0bEA86Ce42F2524Fde5D6a0F4',
  instaFlashResolver: '0xa996699a8f3716FCB5D26652a81b037554128136',
  treasury: '0x6e9d36eaeC63Bc3aD4A47fb0d7826A9922AAfC22',
};


// Optimism contracts
const OPTIMISM_CONTRACTS = {
  index: '0x6CE3e607C808b4f4C26B7F6aDAeB619e49CAbb25',
  instaList: '0x9926955e0Dd681Dc303370C52f4Ad0a4dd061687',
  instaAccount: '0x0a0a82D2F86b9E46AE60E22FCE4e8b916F858Ddc',
  instaConnectors: '0x127d8cD0E2b2E0366D522DeA53A787bfE9002C14',
  instaMemory: '0x3254Ce8f5b1c82431B8f21Df01918342215825C2',
  implementations: '0x01fEF4d2B513C9F69E34b2f93Ef707FA9Ff60109',
  instaFlashAggregator: '0x84e6b05a089d5677a702cf61dc14335b4be5b282',
  instaFlashResolver: '0x810D6b2425Dc5523525D1F45CC548ae9a085F5Ea',
  treasury: '0xdaf12965b3d5bf60843aa1fb49e2688919e697a0',
};

// Fantom contracts
const FANTOM_CONTRACTS = {
  index: '0x2fa042BEEB7A40A7078EaA5aC755e3842248292b',
  instaList: '0x10e166c3FAF887D8a61dE6c25039231eE694E926',
  instaAccount: '0x1a0862ecA9eAc5028aBdf85bD095fd13a7eebA2f',
  instaConnectors: '0x819910794a030403F69247E1e5C0bBfF1593B968',
  instaMemory: '0x56439117379A53bE3CC2C55217251e2481B7a1C8',
  implementations: '0xF0b36681C9d3ED74227880646De41c4a979AC191',
  treasury: '0x6C4061A00F8739d528b185CC683B6400E0cd396a',
};

// Arbitrum TVL
async function arbitrumTvl(api) {
  const contractAddresses = Object.values(ARBITRUM_CONTRACTS);
  const tokens = [
    ADDRESSES.null, // Native ETH
    ADDRESSES.arbitrum.ARB, // ARB
    ADDRESSES.arbitrum.USDC, // USDC.e
    ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
    ADDRESSES.optimism.DAI, // DAI
    ADDRESSES.arbitrum.USDT, // USDT
    ADDRESSES.arbitrum.WETH, // WETH
    ADDRESSES.arbitrum.WBTC, // WBTC
  ];
  
  return sumTokens2({ api, owners: contractAddresses, tokens });
}

// Polygon TVL
async function polygonTvl(api) {
  const contractAddresses = Object.values(POLYGON_CONTRACTS);
  const tokens = [
    ADDRESSES.null, // Native MATIC
    ADDRESSES.polygon.WMATIC_2, // WMATIC
    ADDRESSES.polygon.USDC, // USDC.e
    ADDRESSES.polygon.USDC_CIRCLE, // USDC
    ADDRESSES.polygon.DAI, // DAI
    ADDRESSES.polygon.USDT, // USDT
    ADDRESSES.polygon.WETH_1, // WETH
    ADDRESSES.polygon.WBTC, // WBTC
  ];
  
  return sumTokens2({ api, owners: contractAddresses, tokens });
}

// Optimism TVL
async function optimismTvl(api) {
  const contractAddresses = Object.values(OPTIMISM_CONTRACTS);
  const tokens = [
    ADDRESSES.null, // Native ETH
    ADDRESSES.optimism.OP, // OP
    ADDRESSES.optimism.USDC_CIRCLE, // USDC
    ADDRESSES.optimism.USDC, // USDC.e
    ADDRESSES.optimism.DAI, // DAI
    ADDRESSES.optimism.USDT, // USDT
    ADDRESSES.optimism.WETH_1, // WETH
    ADDRESSES.optimism.WBTC, // WBTC
  ];
  
  return sumTokens2({ api, owners: contractAddresses, tokens });
}

// Fantom TVL
async function fantomTvl(api) {
  const contractAddresses = Object.values(FANTOM_CONTRACTS);
  const tokens = [
    ADDRESSES.null, // Native FTM
    ADDRESSES.fantom.WFTM, // WFTM
    ADDRESSES.fantom.USDC, // USDC
    ADDRESSES.fantom.DAI, // DAI
    ADDRESSES.fantom.fUSDT, // fUSDT
    '0x74b23882a30290451A17c44f4F05243b6b58C76d', // WETH
    ADDRESSES.fantom.WBTC, // WBTC
  ];
  
  return sumTokens2({ api, owners: contractAddresses, tokens });
}

module.exports = {
  arbitrum: {
    tvl: arbitrumTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  optimism: {
    tvl: optimismTvl,
  },
  fantom: {
    tvl: fantomTvl,
  },
  methodology: `TVL counts all tokens held across InstaDapp's Smart Accounts (DSA) contracts on multiple chains including Index, InstaList, InstaAccount, InstaConnectors, InstaMemory, Implementations, InstaFlashAggregator, InstaFlashResolver, and Treasury. Tracks major stablecoins and blue-chip assets deposited by users.`,
  start: 1630454400, // Sept 1, 2021
};