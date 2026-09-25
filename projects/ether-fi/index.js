const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk');
const { staking } = require('../helper/staking');

const sETHFI = '0x86B5780b606940Eb59A062aA85a07959518c0161'
const EBTC = ADDRESSES.ethereum.EBTC
const LIQUIDITY_POOL = '0x308861A430be4cce5502d0A12724771Fc6DaF216'
const TVL_ORACLE_OPTIMISM = '0xAB7590CeE3Ef1A863E9A5877fBB82D9bE11504da'
const EBTC_START = 1746507563

const CBBTC = ADDRESSES.ethereum.cbBTC   // same address on ethereum/base/arbitrum
const LBTC = ADDRESSES.corn.LBTC         // same address on base/berachain

const EBTC_BACKING = {
  ethereum: [ADDRESSES.ethereum.WBTC, ADDRESSES.ethereum.LBTC, CBBTC],
  arbitrum: [ADDRESSES.arbitrum.WBTC, CBBTC],
  base: [LBTC, ADDRESSES.base.cbBTC],
  berachain: [ADDRESSES.berachain.WBTC, LBTC],
}

// receipt tokens booked as the BTC they represent
const EBTC_RECEIPTS = {
  '0x468c34703F6c648CCf39DBaB11305D17C70ba011': ADDRESSES.ethereum.LBTC, // KLBTC
  '0x126d4dBf752AaF61f3eAaDa24Ab0dB84FEcf6891': ADDRESSES.ethereum.WBTC, // KwBTC
  '0x9C0823D3A1172F9DdF672d438dec79c39a64f448': ADDRESSES.ethereum.LBTC, // DC_LBTC
  '0x971e5b5D4baa5607863f3748FeBf287C7bf82618': ADDRESSES.ethereum.WBTC, // DC_WBTC
}

// holds LBTC on eBTC's behalf
const LBTC_HOLDERS = ['0xd4E20ECA1f996Dab35883dC0AD5E3428AF888D45']

const KARAK = '0xAfa904152E04aBFf56701223118Be2832A4449E0'
// karak vault -> the BTC it is denominated in
const KARAK_VAULT_TOKEN = {
  '0x468c34703f6c648ccf39dbab11305d17c70ba011': ADDRESSES.ethereum.LBTC, // KLBTC
  '0x126d4dbf752aaf61f3eaada24ab0db84fecf6891': ADDRESSES.ethereum.WBTC, // KwBTC
}

// ETHFI/sETHFI deployment per chain
const STAKING_START = {
  ethereum: 1708665119, // ETHFI token deployed 2024-02-23
  arbitrum: 1720544785, // sETHFI vault deployed 2024-07-09
  base: 1726161379,     // sETHFI vault deployed 2024-09-12
  optimism: 1774996787, // sETHFI vault deployed 2026-03-31
  scroll: 1742926871,   // ETHFI token deployed 2025-03-25
}

const abi = {
  categoryTVL: 'function categoryTVL(string _category) view returns (uint256)',
  fetchQueuedWithdrawals: 'function fetchQueuedWithdrawals(address staker) view returns (tuple(address staker, address delegatedTo, uint256 nonce, uint256 start, tuple(address[] vaults, uint256[] shares, address withdrawer) request)[] queuedWithdrawals)',
  isWithdrawPending: 'function isWithdrawPending(tuple(address staker, address delegatedTo, uint256 nonce, uint256 start, tuple(address[] vaults, uint256[] shares, address withdrawer) request) withdrawal) view returns (bool)',
}

async function addKarakQueuedWithdrawals(api) {
  const withdrawals = await api.call({ target: KARAK, abi: abi.fetchQueuedWithdrawals, params: [EBTC] })
  const pending = await Promise.all(withdrawals.map(w => api.call({ target: KARAK, abi: abi.isWithdrawPending, params: [w] })))

  withdrawals.forEach(({ request }, i) => {
    if (!pending[i]) return
    request.vaults.forEach((vault, j) => {
      const token = KARAK_VAULT_TOKEN[vault.toLowerCase()]
      if (token) api.add(token, request.shares[j])
    })
  })
}

// eBTC backing, counted on the chain holding it
async function ebtcTvl(api) {
  if (api.timestamp < EBTC_START) return

  await api.sumTokens({ owners: [EBTC], tokens: EBTC_BACKING[api.chain] })
  if (api.chain !== 'ethereum') return

  const receipts = Object.keys(EBTC_RECEIPTS)
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: receipts.map(target => ({ target, params: [EBTC] })) })
  receipts.forEach((receipt, i) => api.add(EBTC_RECEIPTS[receipt], balances[i]))

  await api.sumTokens({ owners: LBTC_HOLDERS, tokens: [ADDRESSES.ethereum.LBTC] })
  await addKarakQueuedWithdrawals(api)
}

async function ethereumTvl(api) {
  const pooledEth = BigInt(await api.call({ target: LIQUIDITY_POOL, abi: 'uint256:getTotalPooledEther' }))

  // eETH held inside ether.fi Liquid, removed so that listing counts it instead.
  let loopedTvl = 0n
  if (!api.timestamp || api.timestamp > EBTC_START) {
    const optimismApi = new sdk.ChainApi({ timestamp: api.timestamp, chain: 'optimism' })
    loopedTvl = BigInt(await optimismApi.call({ target: TVL_ORACLE_OPTIMISM, abi: abi.categoryTVL, params: ['liquideth'] }))
  }
  api.add(ADDRESSES.null, (pooledEth - loopedTvl).toString())

  // booked as USDC (18 -> 6 decimals); permitFailure: eUSD post-dates the LiquidityPool
  const eusd = await api.call({ target: ADDRESSES.ethereum.EUSD, abi: 'uint256:totalSupply', permitFailure: true })
  if (eusd) api.add(ADDRESSES.ethereum.USDC, (BigInt(eusd) / 10n ** 12n).toString())

  await ebtcTvl(api)
}

const stakingTvl = (api) => {
  if (api.timestamp < STAKING_START[api.chain]) return
  return staking(sETHFI, ADDRESSES[api.chain].ETHFI)(api)
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  start: '2023-07-10',
  methodology: "Staked ETH is the ETH backing eETH, read from the LiquidityPool contract on Ethereum, minus categoryTVL('liquideth') from ether.fi's TVL oracle on Optimism — an ether.fi-maintained figure for the eETH exposure held inside the ether.fi Liquid vaults, removed here so those deposits are counted once, by the ether.fi Liquid listing. eUSD is counted at its total supply and booked as USDC. eBTC is counted as the WBTC, LBTC and cbBTC backing it on Ethereum, Arbitrum, Base and Berachain, each booked on the chain that holds it; Karak and strategy receipt tokens, and pending Karak withdrawals, are booked as the BTC they represent. Staking is the ETHFI held by the sETHFI vault on Ethereum, Arbitrum, Base, Optimism and Scroll.",
  ethereum: {
    tvl: ethereumTvl,
    staking: stakingTvl,
  },
  arbitrum: {
    tvl: ebtcTvl,
    staking: stakingTvl,
  },
  base: {
    tvl: ebtcTvl,
    staking: stakingTvl,
  },
  berachain: {
    tvl: ebtcTvl,
  },
  optimism: {
    staking: stakingTvl,
  },
  scroll: {
    staking: stakingTvl,
  },
};
