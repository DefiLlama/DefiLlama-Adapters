const { getProvider,} = require('./helper/solana')
const sdk = require('@defillama/sdk')
const { PublicKey } = require('@solana/web3.js')
const { Program } = require("@coral-xyz/anchor");

const DEFITUNA_CLMM_PROGRAM_ID = "tuna4uSQZncNeeiAMKbstuxA9CUkHH6HmC64wgmnogD";

async function tvl() {
  const balances = {}
  const defiTunaProgramId = new PublicKey(DEFITUNA_CLMM_PROGRAM_ID)
  const provider = getProvider()

  const defiTunaIDL = await Program.fetchIdl(defiTunaProgramId, provider)
  const defiTunaProgram = new Program(defiTunaIDL, provider)
  const vaults = await defiTunaProgram.account.vault.all()

  vaults.forEach((data, i) => {
    const lpMint = data.account.mint.toString()
    sdk.util.sumSingleBalance(balances, lpMint, data.account.depositedFunds, 'solana')
  })
  return balances
}

module.exports = {
  doublecounted: false,
  timetravel: false,
  methodology: 'TVL consists of LP token deposits made to DefiTuna, a decentralized platform offering concentrated liquidity market making (CLMM) with leveraged positions. The platform enables users to open leveraged positions on liquid trading pairs. TVL is calculated by summing the total value of LP tokens deposited into DefiTuna vaults on Solana.',
  solana: { tvl },
};
