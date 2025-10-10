const ADDRESSES = require('../helper/coreAssets.json')
const { post } = require('../helper/http')
const { XRP_MPC_ADDRESS, TERM_RLUSD_VAULT, RLUSD_TOKEN, RIPPLE_ENDPOINT } = require('./addresses')

// ─────────────────────────────────────────────────────────────────────────────
// MoreMarkets DeFiLlama adapter
//
// How we compute TVL (high-level):
// • XRP path ("xrp"): We return the XRP balance (in DROPS) of our XRP MPC wallet
// • Ethereum path ("rlusd"): We return RLUSD held by the Term Strategy RLUSD Vault,
//   reported as ERC-4626 totalAssets() in WEI under the RLUSD ERC-20 address
//
//  - Term RLUSD Vault (app link): https://app.term.finance/vaults/0xb962fd1abd9a365140493bd499acf1ec0acff040/1

//
// Full methodology & FAQs: https://www.moremarkets.xyz/blog/moremarkets-xrp-earn-account-protocol-overview-and-faqs
//
// Notes:
// • We return RAW base units only: DROPS for XRP, WEI for RLUSD
// • All addresses are managed in addresses.js
// ─────────────────────────────────────────────────────────────────────────────

function makeTVL(param) {
  return async (api) => {
    if (param === 'xrp') {
      // Get XRP balance directly from XRPL
      const xrpBalance = await getXrpBalance(XRP_MPC_ADDRESS);
      api.add(ADDRESSES.ripple.XRP, xrpBalance);
    } else if (param === 'rlusd') {
      await getRlusdBalance(api);
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

module.exports = {
  methodology:
    "TVL is calculated as follows: (1) XRP balance retrieved directly from XRPL for our XRP MPC wallet (in DROPS) and (2) RLUSD balance retrieved directly from Term's RLUSD Strategy Vault contract via ERC-4626 totalAssets() (in WEI). See our blog for full details and operational context.",
  timetravel: false,
 
  ripple:   { tvl: makeTVL('xrp') }, 
  ethereum: { tvl: makeTVL('rlusd') },
}