const sdk = require('@defillama/sdk')
const { post } = require('../helper/http');
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { sumUnknownTokens } = require('../helper/unknownTokens');
const { decimals } = require('@defillama/sdk/build/erc20');

// Vault
const HWLP_VAULT = "0x9FD7466f987Fd4C45a5BBDe22ED8aba5BC8D72d1";

// Multi-Sigs
const MS_1 = "0x128Cc5830214aBAF05A0aC178469a28de56C0BA9";
const MS_2 = "0x950e6bc9bba0edf4e093b761df05cf5abd0a32e7";
const MS_3 = "0x4E961B977085B673c293a5C022FdcA2ab3A689a2";
const MS_4 = "0xc8f969ef6b51a428859f3a606e6b103dc1fb92e9";
const MS_5 = "0x2cd4aa47e778fe8fa27cdcd4ce2bc99b6bf90f61";
const MS_ALL = [MS_1, MS_2, MS_3, MS_4, MS_5];

const DELAY = 200; // 200ms delay between requests
// const DELAY = 10000; // 10s delay between requests
const HLP_VAULT = "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303"; // Hyperliquid Vault
const VAULT_TOKENS = [
    ADDRESSES.hyperliquid.USDT0,
    ADDRESSES.hyperliquid.USDe,
    '0xb50A96253aBDF803D85efcDce07Ad8becBc52BD5' // USDHl
];
const HYPER_CORE_TOKENS = [
  // {
  //   symbol: "USDC",
  //   address: ADDRESSES.arbitrum.USDC_CIRCLE,
  //   decimals: 6,
  // },
  {
    symbol: "USDT0",
    address: ADDRESSES.hyperliquid.USDT0,
    decimals: 6,
  },
  {
    symbol: "USDE",
    address: ADDRESSES.hyperliquid.USDe,
    decimals: 18,
  },
  {
    symbol: "USDHL",
    address: '0xb50A96253aBDF803D85efcDce07Ad8becBc52BD5',
    decimals: 6,
  }
]

async function vaultTvl(api) {
  return sumTokens2({
    api,
    owner: HWLP_VAULT,
    chain: 'hyperliquid',
    tokens: VAULT_TOKENS,
  })
}

const delay = () => new Promise(res => setTimeout(res, DELAY));
async function hlpVaultTvl(api) {
    const datas = [];
    for (const eoa of MS_ALL) {
      await delay();
      console.log(`Fetching vault data for ${eoa}`);
      datas.push(await post('https://api.hyperliquid.xyz/info', { type: "userVaultEquities", user: eoa }));
      console.log(`Fetched vault data for ${eoa}`);
    }
    const hlpVaults = datas.flatMap(data => data.filter(v => v.vaultAddress.toLowerCase() === HLP_VAULT.toLowerCase()));
    const hlpEquities = hlpVaults.map(v => parseFloat(v.equity));
    const hlpEquityUpscaled = hlpEquities.reduce((sum, equity) => sum + equity * 1e6, 0); // Convert to wei
    api.addTokens([ADDRESSES.arbitrum.USDC_CIRCLE], [hlpEquityUpscaled])

    return sumUnknownTokens({ api, useDefaultCoreAssets: true})
}

async function hyperCoreSpotBalance(api) {
  const datas = [];
  for (const eoa of MS_ALL) {
    await delay();
    console.log(`Fetching spot balance for ${eoa}`);
    datas.push(await post('https://api.hyperliquid.xyz/info', { type: "spotClearinghouseState", user: eoa }));
    console.log(`Fetched spot balance for ${eoa}`);
  } 
  const balances = datas.flatMap(data => data.balances)
  const coinTotals = {};
  for (const b of balances) {
    if (!coinTotals[b.coin]) coinTotals[b.coin] = 0;
    coinTotals[b.coin] += parseFloat(b.total);
  }
  console.log(coinTotals)
  // adding other core tokens
  const tokens = HYPER_CORE_TOKENS.map(t => t.address);
  const amounts = HYPER_CORE_TOKENS.map(t => coinTotals[t.symbol] ? coinTotals[t.symbol] * 10 ** t.decimals : 0);
  console.log('Adding tokens:', tokens, 'with amounts:', amounts);
  api.addTokens(tokens, amounts);

  // adding USDC balance
  const usdcBalance = coinTotals['USDC'] ? coinTotals['USDC']: 0; // USDC is in 6 decimals
  api.addUSDValue(usdcBalance)

  return sumUnknownTokens({ api, useDefaultCoreAssets: true})
}

module.exports = {
  timetravel: false,
  methodology: 'TVL represents the sum of tokens deposited in the vault + HLP positions + HyperCore Spot positions.',
  doublecounted: false,
  arbitrum: {tvl: hlpVaultTvl},
  hyperliquid: { tvl: sdk.util.sumChainTvls([
    vaultTvl, 
    hyperCoreSpotBalance
  ])},
}