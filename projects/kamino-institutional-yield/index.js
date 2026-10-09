const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require('@solana/web3.js')
const { Program } = require('@project-serum/anchor')
const { getConnection, sumTokens2 } = require('../helper/solana')
const kaminoIdl = require('../kamino-lending/kamino-lending-idl.json')

const KLEND_PROGRAM_ID = 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD'

// Kamino Institutional Commodity Yield (kicUSDC) Earn vault B5pjfZAiKjyUEuqB2694NHrsjcaM67uuJaWqjzTVtzR6
const VAULT_TOKEN_ACCOUNT = 'FxcJaS9ePgXfyeMonNJrBJs43M72gwbEZrZFMBme7yMM' // idle USDC held by the vault
const USDC_RESERVE = 'C2Wp6bpsVevig3AZ1KSCkgHZhsWfN2tw9eQ4kG9z7U7J' // klend reserve in market Dwg1aeZFYtsyMEkoyJn2ak8pPqaXMWd1uui6FBkM1872, borrowed by the SPV

async function getReserve() {
  const connection = getConnection()
  const program = new Program(kaminoIdl, new PublicKey(KLEND_PROGRAM_ID), { connection, publicKey: PublicKey.unique() })
  return program.account.reserve.fetch(new PublicKey(USDC_RESERVE))
}

async function tvl(api) {
  const reserve = await getReserve()
  return sumTokens2({ api, tokenAccounts: [VAULT_TOKEN_ACCOUNT, reserve.liquidity.supplyVault.toString()] })
}

async function borrowed(api) {
  const reserve = await getReserve()
  api.add(ADDRESSES.solana.USDC, reserve.liquidity.borrowedAmountSf / 2 ** 60)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the USDC held on-chain by the Kamino Institutional Commodity Yield vault: idle USDC in the vault plus unborrowed USDC in the klend reserve it allocates to. USDC borrowed from that reserve by the Institutional Yield SPV, which funds off-chain commodity trade finance loans, is reported as borrowed.',
  solana: { tvl, borrowed },
}
