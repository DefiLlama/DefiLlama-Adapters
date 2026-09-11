const { Program } = require('@project-serum/anchor')
const { PublicKey } = require('@solana/web3.js')
const { getProvider, getTokenAccountBalances } = require('../helper/solana')
const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

const big = (v) => BigInt(v.toString())
const prog = (idl, id) => new Program(idl, new PublicKey(id), getProvider())
const erc4626 = (...vaults) => ({ tvl: sumERC4626VaultsExport2({ vaults }) })

module.exports = {
  methodology: 'Total value of assets deposited in the Byzanlink vaults, read on-chain and valued in USD.',
  hedera: erc4626('0x6b8dfA6aa5f803a886Beb2492eF3307EC0Ee16FB'), // Credible PayFi Vault
  ethereum: erc4626('0xA5cDEE01aA7A5E0620df5f27F26E552fdf7f5F20'), // bSyrupUSDC
  solana: {
    tvl: async (api) => {
      const vaultProgram = prog(require('./byzanlink-vault-idl.json'), 'HyuZ17H9ScJ6GsMnJMYTCUZrw6Jz4AS4RGD9h3Pt4Se') // Byzanlink vault program
      const vault = await vaultProgram.account.vaultState.fetch('96k5AKfdHMW6URrn3Qwn4wp3gN4S2GupK27dPxtt3vfw') // Credible PayFi Vault

      const [{ pool: poolKey, sharesAllocation }] = vault.vaultAllocationStrategy
      const shares = big(sharesAllocation)
      let allocated = 0n

      // an unallocated slot leaves the pool unset, so there is nothing to fetch or value
      if (shares > 0n) {
        const payfiProgram = prog(require('./payfi-vault-idl.json'), 'B9wHQVTeCkZ8KM8nZTBfHQyfQhJvuihhHa9SdWo4x77U') // PayFi pool program
        const pool = await payfiProgram.account.pool.fetch(poolKey)
        const [liq] = await getTokenAccountBalances([pool.poolLiquidityVault], { individual: true })

        // Pool::exchange_rate backing: real_assets() plus repaid liquidity awaiting redemption
        const backing = big(pool.reportedNav)
          + big(pool.inflowSinceLastNavUpdate)
          - big(pool.outflowSinceLastNavUpdate)
          + big(liq.amount)

        allocated = shares * backing / big(pool.totalSharesIssued)
      }

      api.add(vault.tokenMint.toString(), (big(vault.tokenAvailable) + allocated).toString())
    },
  },
}
