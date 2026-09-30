const { treasuryExports } = require('../helper/treasury')
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

// Kal Mydas protocol treasury on Base mainnet.
// - Gnosis Safe multisig (protocol treasury: USDC, KAL)
// - TreasuryRWAV2 (tokenized gold and bitcoin reserve, being funded)
// - RainyDayFund (emergency reserve)
// - Protocol KAL held by the presale, airdrop, referral and depositor bonus contracts (ownTokens)
// - Platform reserve held inside the KalPool strategy vaults (reserveBalance - operatorBalance),
//   excluded from the Kal Mydas protocol TVL
const KAL = '0xe99556D5594faf533fcB346A8a9B11259D29afA8'
const USDC = ADDRESSES.base.USDC

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

const exportsObj = treasuryExports({
  base: {
    owners: [
      '0x55a7645F04CEbCE3eb706D441cB649fFDe4D5027', // Gnosis Safe multisig
      '0x4f1F316e76d8E8637006eF246E9dD6dc3b4680C1', // TreasuryRWAV2
      '0xD1795dD0Cfe169E4dE601469C07E0c4884aD251f', // RainyDayFund
    ],
    tokens: [ADDRESSES.base.USDC, ADDRESSES.base.WETH],
    ownTokens: [KAL],
    ownTokenOwners: [
      '0x6466C5042669f8d6D7f0c725B51cD2650d1E1b9A', // KAL presale (unsold KAL)
      '0xB04E37e0568873f29f3666E3b94810B6CeA4Ee57', // KAL airdrop reserve
      '0xadEd1b00159fABCefd111bA97E64875B8c82a21A', // referral rewards reserve
      '0x2F437493a8899bBd3B7dB41597d9f2695B7070c9', // KalPoolRewardsV3, depositor KAL bonus reserve
      '0x5dEE301aD9290DC5BAFa8cC6F6e359bDDF5356ea', // KalPoolRewardsV2 (previous generation)
    ],
  },
})

exportsObj.base.tvl = sdk.util.sumChainTvls([exportsObj.base.tvl, vaultReserves])

module.exports = exportsObj
