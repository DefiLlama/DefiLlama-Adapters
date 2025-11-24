const ADDRESSES = require('../helper/coreAssets.json')
const { post, get } = require('../helper/http')
const { XRP_MPC_ADDRESS, TERM_RLUSD_VAULT, RLUSD_TOKEN, RIPPLE_ENDPOINT, STNEAR_CONTRACT, NEAR_ACCOUNT, NEAR_ENDPOINT, MORE_MARKETS_API, HYPER_ETH, HYPER_BTC, HYPER_USD, FLARE_FXRP_TOKEN, FLARE_FXRP_LENS, FLARE_FXRP_ACCOUNTANT, HYPER_ETH_DATA_FEED, HYPER_BTC_DATA_FEED, HYPER_USD_DATA_FEED } = require('./addresses')

// ─────────────────────────────────────────────────────────────────────────────
// MoreMarkets DeFiLlama adapter
//
// How we compute TVL (high-level):
// 
// • Ripple: XRP balance from XRPL MPC wallet + XRP Prime TVL from API
//   - Direct balance query via XRPL RPC (account_info)
//   - API call to https://api.moremarkets.xyz/api/vaults/xrp-prime
//
// • Ethereum: RLUSD vault + hyperETH/BTC/USD Boring Vaults
//   - RLUSD: ERC-4626 vault totalAssets()
//   - hyperETH/BTC/USD: Midas data feeds (lastAnswer * totalSupply)
//
// • Flare: fXRP Boring Vault
//   - Lens contract totalAssets(boringVault, accountant)
//
// • Near: stNEAR balance
//   - Near RPC ft_balance_of call to meta-pool.near
//
// Full methodology: https://www.moremarkets.xyz/blog/moremarkets-xrp-earn-account-protocol-overview-and-faqs
//
// Notes:
// • All balances returned in base units (DROPS for XRP, WEI for ERC-20s, etc)
// • All addresses are managed in addresses.js
// ─────────────────────────────────────────────────────────────────────────────

function makeTVL(param) {
  return async (api) => {
    if (param === 'xrp') {
      // Get XRP balance directly from XRPL
      const xrpBalance = await getXrpBalance(XRP_MPC_ADDRESS);
      api.add(ADDRESSES.ripple.XRP, xrpBalance);
      // Get XRP Prime TVL from MoreMarkets API
      await getXrpPrimeBalance(api);
    } else if (param === 'rlusd') {
      await getRlusdBalance(api);
      await getMTokenBalances(api);
    } else if (param === 'flare_fxrp') {
      await getFlareFxrpBalance(api);
    } else if (param === 'stnear') {
      await getstNearBalance(api);
    }
    return api.getBalances()
  }
}

async function getXrpBalance(account) {
  const body = {
    method: 'account_info',
    params: [{ account: account, ledger_index: 'validated' }]
  };
  const res = await post(RIPPLE_ENDPOINT, body);
  
  if (res.result.status === 'success' && res.result.account_data) {
    // XRP balance is in drops (1 XRP = 1,000,000 drops)
    return res.result.account_data.Balance;
  }
  
  return "0";
}

async function getXrpPrimeBalance(api) {
  const res = await get(`${MORE_MARKETS_API}/vaults/xrp-prime`);
  
  if (res && res.tvl_base) {
    // tvl_base is in XRP, convert to drops (1 XRP = 1,000,000 drops)
    const drops = Math.floor(res.tvl_base * 1_000_000);
    api.add(ADDRESSES.ripple.XRP, drops.toString());
  }
}

async function getRlusdBalance(api) {
  // Get both the underlying asset and total assets from the ERC-4626 vault
  const [asset, totalAssets] = await Promise.all([
    api.call({
      abi: 'address:asset',
      target: TERM_RLUSD_VAULT,
    }),
    api.call({
      abi: 'uint256:totalAssets',
      target: TERM_RLUSD_VAULT,
    })
  ]);
  
  // Add the balance using the underlying asset address
  api.add(asset, totalAssets);
}

async function getMTokenBalances(api) {
  // Calculate TVL using Midas data feed: (lastAnswer / 10^decimals) * (totalSupply / 10^18) * 10^underlyingDecimals
  const mTokens = [
    { token: HYPER_ETH, dataFeed: HYPER_ETH_DATA_FEED, underlying: ADDRESSES.ethereum.WETH, underlyingDecimals: 18 },
    { token: HYPER_BTC, dataFeed: HYPER_BTC_DATA_FEED, underlying: ADDRESSES.ethereum.WBTC, underlyingDecimals: 8 },
    { token: HYPER_USD, dataFeed: HYPER_USD_DATA_FEED, underlying: ADDRESSES.ethereum.USDC, underlyingDecimals: 6 },
  ];
  
  for (const { token, dataFeed, underlying, underlyingDecimals } of mTokens) {
    // Get total supply (in 18 decimals)
    const totalSupply = await api.call({
      abi: 'uint256:totalSupply',
      target: token,
    });
    
    // Get price per share from Midas data feed
    const lastAnswer = await api.call({
      abi: 'int256:lastAnswer',
      target: dataFeed,
    });
    
    // Get decimals from data feed
    const feedDecimals = await api.call({
      abi: 'uint8:decimals',
      target: dataFeed,
    });
    
    // Calculate: (lastAnswer * totalSupply * 10^underlyingDecimals) / (10^feedDecimals * 10^18)
    // This gives us the total value in underlying asset base units (wei/satoshi/etc)
    const totalValue = (BigInt(lastAnswer) * BigInt(totalSupply) * BigInt(10 ** underlyingDecimals)) / 
                       (BigInt(10 ** Number(feedDecimals)) * BigInt(10 ** 18));
    
    api.add(underlying, totalValue.toString());
  }
}

async function getFlareFxrpBalance(api) {
  // Get total assets directly from lens contract
  const result = await api.call({
    abi: 'function totalAssets(address,address) view returns (address asset, uint256 assets)',
    target: FLARE_FXRP_LENS,
    params: [FLARE_FXRP_TOKEN, FLARE_FXRP_ACCOUNTANT],
  });
  
  // result is an object with asset and assets properties
  const asset = result.asset || result[0];
  const assets = result.assets || result[1];
  
  // Add the balance using the underlying asset address
  api.add(asset, assets);
}

async function getstNearBalance(api) {
  const balance = await getNearFtBalance(STNEAR_CONTRACT, NEAR_ACCOUNT);
  // Add stNEAR balance to Near chain
  api.add(STNEAR_CONTRACT, balance);
}

async function getNearFtBalance(contractId, accountId) {
  const body = {
    jsonrpc: '2.0',
    id: 'dontcare',
    method: 'query',
    params: {
      request_type: 'call_function',
      finality: 'final',
      account_id: contractId,
      method_name: 'ft_balance_of',
      args_base64: Buffer.from(JSON.stringify({ account_id: accountId })).toString('base64')
    }
  };
  
  const res = await post(NEAR_ENDPOINT, body);
  
  if (res.result && res.result.result) {
    // Parse the result from bytes to string
    const resultString = Buffer.from(res.result.result).toString('utf-8');
    // Remove quotes if present and return the balance
    return resultString.replace(/"/g, '');
  }
  
  return "0";
}

module.exports = {
  methodology:
    "TVL is calculated across multiple chains: (1) Ripple: XRP wallet balance + XRP Prime vault via API, (2) Ethereum: RLUSD ERC-4626 vault + hyperETH/BTC/USD Boring Vaults via Midas data feeds, (3) Flare: fXRP Boring Vault via lens contract, (4) Near: stNEAR balance via ft_balance_of. All balances in base units (DROPS/WEI). See our blog for full methodology.",
  timetravel: false,
 
  ripple: { tvl: makeTVL('xrp') },
  ethereum: { tvl: makeTVL('rlusd') },
  flare: { tvl: makeTVL('flare_fxrp') },
  near: { tvl: makeTVL('stnear') },
}