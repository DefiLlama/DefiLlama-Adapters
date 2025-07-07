const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require('../helper/unwrapLPs');
const { post } = require("../helper/http");

const sanitizeAndValidateEvmAddresses = (addresses) => {
  return addresses
    .map((address) => address.replace(/_$/, ""))
    .filter((address) => /^0x[a-fA-F0-9]{40}$/.test(address));
};

const LHYPE_VAULT_ADDRESS = '0x5748ae796AE46A4F1348a1693de4b50560485562';
const USDhl = '0xb50A96253aBDF803D85efcDce07Ad8becBc52BD5';

const HYPERLIQUID_INFO_URL = 'https://api.hyperliquid.xyz/info'

const WHLP_VAULT_ADDRESS = '0x1359b05241cA5076c9F59605214f4F84114c0dE8'
const HLP_VAULT_ADDRESS = '0xdfc24b077bc1425ad1dea75bcb6f8158e10df303'
const WHLP_HYPER_CORE_MULTISIGS = [
  '0x9fcB7066C8AeEe704f9D017996b490873b306E51',
  '0x41f45A847bB6c8bFf1448FEE5C9525875D443b9E',
  '0x296B1078D860c69C94CA933c4BcD2d6f192DD86e',
  '0x31Cbd708B505d3A9A0dae336BC9476b694256e74',
  '0xFBB47621086901487C7f3beC6F23205738d59e27',
]

const fetchUsdBalances = async (userAddress) => {
  // Spot balance payload
  const spotPayload = {
    type: 'spotClearinghouseState',
    user: userAddress,
  }

  // Perp balance payload
  const perpPayload = {
    type: 'clearinghouseState',
    user: userAddress,
  }

  const [spotBalance, perpBalance] = await Promise.all([
    post(HYPERLIQUID_INFO_URL, spotPayload),
    post(HYPERLIQUID_INFO_URL, perpPayload),
  ])

  const perpBalanceTotal = Number(perpBalance.marginSummary.accountValue)
  const spotBalances = spotBalance.balances

  // Extract USDC balance for total calculation
  const usdcBalance = spotBalances.find(
    (balance) => balance.coin === 'USDC'
  )
  const usdcTotal = usdcBalance ? Number(usdcBalance.total) : 0

  // Extract USDHL and USDT0 balances for the map
  const usdhlBalance = spotBalances.find(
    (balance) => balance.coin === 'USDHL'
  )
  const usdt0Balance = spotBalances.find(
    (balance) => balance.coin === 'USDT0'
  )

  const stablecoinBalances = {
    USDHL: usdhlBalance ? Number(usdhlBalance.total) : 0,
    USDT0: usdt0Balance ? Number(usdt0Balance.total) : 0,
  }

  // Return combined total of perp balance + USDC balance, plus stablecoin map
  return {
    totalPerpAndSpotUsdc: perpBalanceTotal + usdcTotal,
    stablecoinBalances,
  }
}

const fetchHlpBalance = async (userAddress) => {
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'vaultDetails',
      vaultAddress: HLP_VAULT_ADDRESS, // HLP vault on Hyper Core
      user: userAddress, // Each multisig address that deposits into HLP for WHLP
    }),
  }

  try {
    const data = await fetch(HYPERLIQUID_INFO_URL, payload)
    if (!data.ok) {
      throw new Error(`HTTP error! status: ${data.status}`)
    }
    // Return 0 if followerState is null/undefined
    const dataJson = await data.json()
    
    if (!dataJson.followerState) {
      return 0
    }
    const vaultEquity = Number(dataJson.followerState.vaultEquity)
    return vaultEquity
  } catch (error) {
    console.error('Error posting vault info:', error)
    return 0
  }
}

const tvl = async (api) => {
  // Get WHLP TVL from HyperLiquid API for each multisig
  let totalWhlpTvl = 0;
  let totalUsdBalances = 0;
  
  for (const multisig of WHLP_HYPER_CORE_MULTISIGS) {
    try {
      // Fetch HLP balance
      const hlpBalance = await fetchHlpBalance(multisig);
      totalWhlpTvl += hlpBalance;
      
      // Fetch USD balances
      const usdBalances = await fetchUsdBalances(multisig);
      totalUsdBalances += usdBalances.totalPerpAndSpotUsdc;
    } catch (error) {
      console.error(`Error fetching balances for ${multisig}:`, error);
    }
  }

  // Add WHLP TVL to API
  if (totalWhlpTvl > 0) {
    api.addUSDValue(totalWhlpTvl);
  }
  
  // Add USD balances to API
  if (totalUsdBalances > 0) {
    api.addUSDValue(totalUsdBalances);
  }

  // Get Nucleus strategies for your vault
  const lhypeStrategies = await getConfig(
    'lhype-tokens',
    `https://backend.nucleusearn.io/v1/vaults/underlying_strategies?vault_address=${LHYPE_VAULT_ADDRESS}&chain_id=999`
  );
  
  const lhypeStrategy = lhypeStrategies['999']
  if (lhypeStrategy) {
    const lhypeTokens = Object.values(lhypeStrategy).map((strategy) => strategy.tokenAddress);
    const sanitizedTokens = sanitizeAndValidateEvmAddresses([...lhypeTokens, LHYPE_VAULT_ADDRESS, USDhl]);

    // Add TVL from strategies
    await sumTokens2({
      owners: [LHYPE_VAULT_ADDRESS, WHLP_VAULT_ADDRESS],
      tokens: sanitizedTokens,
      api,
      resolveLP: true
    });
  }
};

module.exports = {
  hyperliquid: { tvl }
};