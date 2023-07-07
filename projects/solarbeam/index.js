const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const wMOVR = "0x98878B06940aE243284CA214f92Bb71a2b032B8A" // their own barely used version

const stableSwapPools = {
  '3pool': {
    name: '3pool',
    address: '0x9785478135BaFe3dCafe4BBa4C8311674D4E826E',
    assets: ['USDC', 'BUSD', 'USDT'],
    lpToken: '3pool'
  },
  'frax-3pool': {
    name: 'FRAX',
    address: '0x4BB7177319BD1746c3082DDd41c7663E2dbF0f31',
    assets: ['FRAX', '3pool'],
    lpToken: 'frax-3pool',
    basePool: '3pool',
    basePoolIndex: 1
  },
  stksm: {
    name: 'stKSM',
    address: '0x77D4b212770A7cA26ee70b1E0f27fC36da191c53',
    assets: ['xcKSM', 'stKSM'],
    lpToken: 'stksm'
  },
  'kbtc-btc': {
    name: ' BTC-kBTC',
    address: '0xC5d0c8e241b59F989e37B5C35925C58F8c7F66A8',
    assets: ['xcKBTC', 'WBTC'],
    lpToken: 'kbtc-btc'
  },
  'mim-3pool': {
    name: 'MIM',
    address: '0x2a9Fe2514Ed1DaC1C1f5a6d7710C9F6599A27e98',
    assets: ['MIM', '3pool'],
    lpToken: 'mim-3pool',
    basePool: '3pool',
    basePoolIndex: 1
  },
  'mai-3pool': {
    name: 'MAI',
    address: '0x358B4060849E9069482983DEc5E0db671c3337Ff',
    assets: ['MAI', '3pool'],
    lpToken: 'mai-3pool',
    basePool: '3pool',
    basePoolIndex: 1
  }
}

const stableSwapTokens = {
  USDC: {
    address: ADDRESSES.moonriver.USDC,
    decimals: 6,
    symbol: 'USDC',
    gecko: 'usd-coin'
  },
  USDT: {
    address: ADDRESSES.moonriver.USDT,
    decimals: 6,
    symbol: 'USDT',
    gecko: 'tether'
  },
  BUSD: {
    address: '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818',
    decimals: 18,
    symbol: 'BUSD',
    gecko: 'binance-usd'
  },
  FRAX: {
    symbol: 'FRAX',
    name: 'FRAX',
    address: '0x1A93B23281CC1CDE4C4741353F3064709A16197d',
    decimals: 18,
    gecko: 'frax'
  },
  MIM: {
    symbol: 'MIM',
    name: 'Magic Internet Money',
    address: '0x0caE51e1032e8461f4806e26332c030E34De3aDb',
    decimals: 18,
    gecko: 'magic-internet-money'
  },
  MAI: {
    symbol: 'MAI',
    name: 'Mai Stablecoin',
    address: '0xFb2019DfD635a03cfFF624D210AEe6AF2B00fC2C',
    decimals: 18,
    gecko: 'mimatic'
  },
  xcKSM: {
    symbol: 'xcKSM',
    name: 'xcKSM',
    address: '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080',
    decimals: 12,
    gecko: 'kusama'
  },
  stKSM: {
    symbol: 'stKSM',
    name: 'stKSM',
    address: '0xFfc7780C34B450d917d557E728f033033CB4fA8C',
    decimals: 12,
    gecko: 'kusama'
  },
  xcKBTC: {
    symbol: 'xcKBTC',
    name: 'Kintsugi Wrapped BTC',
    address: '0xFFFfFfFfF6E528AD57184579beeE00c5d5e646F0',
    decimals: 8,
    gecko: 'bitcoin'
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    address: ADDRESSES.oasis.USDT,
    decimals: 8,
    gecko: 'bitcoin'
  }
}

async function stableDexTVL(timestamp, _block, chainBlocks) {
  const block = chainBlocks.moonriver
  let balances = {};
  let calls = [];

  for (const pool of Object.values(stableSwapPools)) {
    for (const token of pool.assets)
      if (stableSwapTokens[token]) {
        calls.push({
          target: stableSwapTokens[token].address,
          params: pool.address,
        });
      }
  }

  // Pool Balances
  let balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: calls,
    abi: "erc20:balanceOf",
    chain: 'moonriver'
  });

  // Compute Balances
  balanceOfResults.output.forEach((balanceOf) => {
    let address = balanceOf.input.target;
    let amount = balanceOf.output;
    amount = BigNumber(amount).toFixed();
    balances[address] = BigNumber(balances[address] || 0)
      .plus(amount)
      .toFixed();
  });


  const finalBalances = {}
  for (const tokenAddress in balances) {
    const asset = Object.values(stableSwapTokens).find(r => r.address.toLowerCase() == tokenAddress.toLowerCase());
    sdk.util.sumSingleBalance(finalBalances, asset.gecko, (balances[tokenAddress]) / (10 ** asset.decimals))
  }

  return finalBalances;
}

const dexTVL = getUniTVL({
  factory: '0x049581aEB6Fe262727f290165C29BDAB065a1B68',
  chain: 'moonriver',
  coreAssets: [
    '0xf50225a84382c74CbdeA10b0c176f71fc3DE0C4d', // moonriver
    "0x98878B06940aE243284CA214f92Bb71a2b032B8A", // WMOVR
    // ADDRESSES.moonriver.USDT, // usdt
    ADDRESSES.moonriver.USDC, // usdc
    ADDRESSES.moonriver.ETH, // eth
  ]
})

module.exports = {
  misrepresentedTokens: true,
  moonriver: {
    tvl: sdk.util.sumChainTvls([dexTVL, stableDexTVL,]),
  }
}
