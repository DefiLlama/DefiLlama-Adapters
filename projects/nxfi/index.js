const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");

const idl = require('./idl')

function i80f48ToNumber(i80f48) {
  if (i80f48.value) i80f48 = i80f48.value
  // Create a mask with the lower 48 bits set to 1
  const mask = BigInt((1n << 48n) - 1n)

  // Shift right by 48 bits to get the integer part
  const integerPart = BigInt(i80f48) >> BigInt(48)

  // Use bitwise AND to get the fractional part
  const fractionalPart = BigInt(i80f48) & mask

  // Convert to regular numbers and add together
  return Number(integerPart) + Number(fractionalPart) / Number(1n << 48n)
}

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, 'NxFiv1eeKtKT6dQEP2erBwz2DSKCTdb8WSsxVDwVGJ1', provider)
  const reserves = await program.account.reserve.all()
  return sumTokens2({ tokenAccounts: reserves.map(r => r.account.tokenInfo.tokenAccount.toString()) });
}
async function borrowed(api) {
  const provider = getProvider()
  const program = new Program(idl, 'NxFiv1eeKtKT6dQEP2erBwz2DSKCTdb8WSsxVDwVGJ1', provider)
  const reserves = await program.account.reserve.all()
  reserves.map(r=>{
    const amount = i80f48ToNumber(r.account.creditDebit.debtNtokenRatio) * i80f48ToNumber(r.account.creditDebit.reserveDebtNtokenAmount)
    const mint = r.account.tokenMint.toString()
    api.add(mint, amount)
  })
}

module.exports = {
  timetravel: false,
  solana: { tvl,borrowed },
}
