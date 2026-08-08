const { PublicKey } = require('@solana/web3.js')
const { getConnection, sumTokens2, sumTokensExport } = require('../helper/solana')

const CLASSIC_SOL_TREASURY = 'CkNY5wS3zfU4rSGoGhmu555NxA7ch8bZ3srZZroNjHzm'
const NOVA_SOL_TREASURY = 'EMCwkeGAxsMAPWU2gXW3H8mde2kzCm228kthwEznrPsZ'
const NOVA_USDC_TREASURY = 'CBWMnizg2pQCqDXa1ZSdp8TH2FsfUMv9cp9RAPzatbzK'
const NOVA_VOID_TREASURY = 'BtMJfuacZNmzEpjHrbHqpPJyH2bAHwSDtsu5GUxCGhk1'
const CORE_PROGRAM = new PublicKey('4WJnXP7mFxFY45SYvfyGDwEBdcwafVqdgbYYSHpoded4')
const USER_VOID_PROGRAM = new PublicKey('voiDecqpJdvgeCG9CerdEZY7WwY1mrQM1n3jDnWMzPi')
const USER_VOID_ACCOUNT_DISCRIMINATOR_B58 = 'J6ZWGMgjwQC'
const RELAYER_COLLATERAL_ACCOUNT_DISCRIMINATOR_B58 = 'VKkHcGo512B'

const addFourFixedPools = sumTokensExport({
  solOwners: [CLASSIC_SOL_TREASURY, NOVA_SOL_TREASURY],
  tokenAccounts: [NOVA_USDC_TREASURY, NOVA_VOID_TREASURY],
})

function deriveUserVoidTvlVaults(userVoidAccounts) {
  return userVoidAccounts.map(({ account }) => {
    if (!account?.data || account.data.length < 32)
      throw new Error('UserStake account data too short')

    const user = account.data.subarray(0, 32)
    return PublicKey.findProgramAddressSync(
      [Buffer.from('stake_vault'), user],
      USER_VOID_PROGRAM,
    )[0].toString()
  })
}

async function addUserVoidTvl(api) {
  const userVoidAccounts = await getConnection().getProgramAccounts(USER_VOID_PROGRAM, {
    dataSlice: { offset: 8, length: 32 },
    filters: [{ memcmp: { offset: 0, bytes: USER_VOID_ACCOUNT_DISCRIMINATOR_B58 } }],
  })
  return sumTokens2({ api, tokenAccounts: deriveUserVoidTvlVaults(userVoidAccounts) })
}

function deriveRelayerCollateralVaults(relayerCollateralAccounts) {
  return relayerCollateralAccounts.map(({ account }) => {
    if (!account?.data || account.data.length < 32)
      throw new Error('RelayerStake account data too short')

    const relayer = account.data.subarray(0, 32)
    return PublicKey.findProgramAddressSync(
      [Buffer.from('relayer-stake-vault'), relayer],
      CORE_PROGRAM,
    )[0].toString()
  })
}

async function staking(api) {
  const relayerCollateralAccounts = await getConnection().getProgramAccounts(CORE_PROGRAM, {
    dataSlice: { offset: 8, length: 32 },
    filters: [{ memcmp: { offset: 0, bytes: RELAYER_COLLATERAL_ACCOUNT_DISCRIMINATOR_B58 } }],
  })
  return sumTokens2({
    api,
    tokenAccounts: deriveRelayerCollateralVaults(relayerCollateralAccounts),
  })
}

async function tvl(api) {
  await addFourFixedPools(api)
  await addUserVoidTvl(api)
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  methodology: 'TVL includes user-withdrawable SOL, USDC, and VOID across Voidify. Relayer VOID collateral is reported in the staking bucket. Protocol-owned assets, governance balances, reward vaults, and unclaimed protocol fees are excluded.',
  solana: {
    tvl,
    staking,
  },
}
