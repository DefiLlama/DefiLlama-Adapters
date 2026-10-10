const { treasuryExports } = require('../helper/treasury')
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const KAL = '0xe99556D5594faf533fcB346A8a9B11259D29afA8'
const USDC = ADDRESSES.base.USDC
const SAFE = '0x55a7645F04CEbCE3eb706D441cB649fFDe4D5027'

// KAL/USDC LP owned by the Safe: KalSwap V3, KalSwap V2, Aerodrome (KalSwap pairs expose no token0/token1)
const POL_PAIRS = [
  '0x1FaC3B6a11C441Dd1535deB4c1140a7D01fB8E98',
  '0x3315E6E788E2B30aF8f4c35124695E60D510c31B',
  '0x65e8d79D0103A470e92A81F2cDB970bA9a823b9E',
]

const VAULTS = [
  '0x96869F08F5B5C52664c9620269394eFF4efd065b',
  '0x6dd6e7A6154293b22Dcd5d07d8f61F446646B15d',
  '0x9A9990fdFf702f7aEd10f873eeD2baB60e493038',
  '0x03FEC25393C38cC5DE1F2D2DB620b8478cAC4Ae0',
  '0x55F8D85749EA9C374b3aBFaEF7B07429546F6A97',
  '0xd647F01EDb2e327E4928F84C1be05eaC83c29326',
  '0xeC0F2B417741BF827d7ead53f0a9722847b6aB2d',
  '0xC04A2FbE7816Db5bF33b45D25c0F813b2BF67717',
  '0x887e1787684879Ab4Aa3544C4eAeA394E8da8dBf',
  '0xf5aC77495227741CeB696d43Cd0fD4Ed83F73Bf8',
  '0x9b87C7075ca523a160F6e9657dDEedb263CFa3c2',
  '0x7393819B67A4f70C307831B114Ca5f5e224bebF1',
  // V5_2_2
  '0x6bDdFAA9Fe728bEee4A14FD64F7C770490A42654',
  '0xAb1825cB888c88a283518905f7981C3b2E158bD8',
  '0xB502e605804d03c45Ea8a7f73814Fd3efcB2975d',
  '0xeCf3c5963B3514714F9d6bDC3F481EB8e4007Aa9',
  '0x04495A5F602fad117cC39806603c95D458De405E',
  '0x9455fFC22D84031BAf05f3091DB4FF6e48722F77',
]

async function vaultReserves(api) {
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', target: USDC, calls: VAULTS })
  // vaults not yet deployed at this block hold no USDC and revert on the getters, so skip empty ones
  const funded = VAULTS.map((vault, i) => ({ vault, held: BigInt(balances[i]) })).filter(v => v.held > 0n)
  const calls = funded.map(v => v.vault)
  const [reserves, operatorBalances] = await Promise.all([
    api.multiCall({ abi: 'uint256:reserveBalance', calls }),
    api.multiCall({ abi: 'uint256:operatorBalance', calls }),
  ])
  funded.forEach(({ held }, i) => {
    let reserveInVault = BigInt(reserves[i]) - BigInt(operatorBalances[i])
    if (reserveInVault > held) reserveInVault = held
    if (reserveInVault > 0n) api.add(USDC, reserveInVault.toString())
  })
  return api.getBalances()
}

// USDC side of the Safe's LP; the KAL side is the protocol's own token
async function polUSDC(api) {
  const pairUSDC = await api.multiCall({ abi: 'erc20:balanceOf', target: USDC, calls: POL_PAIRS })
  // pairs not yet deployed at this block hold no USDC, so skip empty ones
  const live = POL_PAIRS.map((pair, i) => ({ pair, usdc: BigInt(pairUSDC[i]) })).filter(p => p.usdc > 0n)
  const [lpHeld, supplies] = await Promise.all([
    api.multiCall({ abi: 'erc20:balanceOf', calls: live.map(p => ({ target: p.pair, params: SAFE })) }),
    api.multiCall({ abi: 'erc20:totalSupply', calls: live.map(p => p.pair) }),
  ])
  live.forEach(({ usdc }, i) => api.add(USDC, (usdc * BigInt(lpHeld[i]) / BigInt(supplies[i])).toString()))
  return api.getBalances()
}

const exportsObj = treasuryExports({
  base: {
    owners: [
      SAFE, // Gnosis Safe (1-of-1)
      '0x4f1F316e76d8E8637006eF246E9dD6dc3b4680C1', // TreasuryRWAV2 (no RWA protocol registered yet)
      '0xD1795dD0Cfe169E4dE601469C07E0c4884aD251f', // RainyDayFund
    ],
    tokens: [ADDRESSES.null, ADDRESSES.base.USDC, ADDRESSES.base.WETH],
    fetchCoValentTokens: false,
    ownTokens: [KAL],
    ownTokenOwners: [
      '0x6466C5042669f8d6D7f0c725B51cD2650d1E1b9A', // KAL presale (unsold KAL)
      '0xB04E37e0568873f29f3666E3b94810B6CeA4Ee57', // KAL airdrop reserve
      '0xadEd1b00159fABCefd111bA97E64875B8c82a21A', // referral rewards reserve
      '0x77feeA49fd83A635fa3474e23D89534Cb1b1b809', // KalPoolRewardsV4, depositor KAL bonus reserve
      '0x2F437493a8899bBd3B7dB41597d9f2695B7070c9', // KalPoolRewardsV3 (previous generation)
      '0x5dEE301aD9290DC5BAFa8cC6F6e359bDDF5356ea', // KalPoolRewardsV2 (previous generation)
    ],
  },
})

exportsObj.base.tvl = sdk.util.sumChainTvls([exportsObj.base.tvl, vaultReserves, polUSDC])

module.exports = exportsObj
