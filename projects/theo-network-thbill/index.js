const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// Reserve wallets
const BACKING     = '0xAECCa546baFB16735b273702632C8Cbb83509d8F' // thBILL backing wallet (EVM, all chains)
const FILQ_WALLET = '0x8397ac82204352c8bafcbaa22e9674a4d638aee3' // FILQ-A holding wallet (Ethereum)

// Ethereum reserve assets
const ULTRA_ETH = '0x50293DD8889B931EB3441d2664dce8396640B419' // Delta Wellington Ultra Short Treasury Fund
const FILQ_A    = '0x54a4fC78431F9201824643e99BeC891BB7462a1D' // Fidelity USD Digital Liquidity Fund (Acc)
const aEthUSDC  = '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c' // Aave v3
const GTUSDCP   = '0x8c106eedad96553e64287a5a6839c3cc78afa3d0' // Morpho Gauntlet USDC Prime
const GTUSDTP   = '0xf3557ad5e984211ac8a0874a670344f2c3376471' // Morpho Gauntlet USDT Prime
const STEAKUSDT = '0xbeef003c68896c7d2c3c60d363e8d71a49ab2bf9' // Morpho Steakhouse USDT

// Other chains
const ULTRA_ARB    = '0xc26af85ede9cc25d449bcebef866bb85afd5d346'
const GTUSDCP_BASE = '0x050ce30b927da55177a4914ec73480238bad56f0' // Morpho Gauntlet USDC Prime (Base)
const aMonUSDC     = '0x35a73bacb179d3740395a3cecc87ff2e581d6042' // Aave v3 on Monad

// Solana
const ULTRA_TOKEN_ACCOUNT = '6fk5UwZXF1Zs327zV5Fbmay2xTYCqg7eM5QeNQyyu7ae'
const ULTRA_MINT          = '9DRPPWYud8i6CaSsDsFESs1xyVr8dBCMtjPZji2xiZEa'

async function solanaTvl(api) {
  const connection = getConnection()
  const accountInfo = await connection.getAccountInfo(new PublicKey(ULTRA_TOKEN_ACCOUNT))
  if (accountInfo) {
    const balance = Number(accountInfo.data.readBigUInt64LE(64))
    api.add(ULTRA_MINT, balance)
  }
}

module.exports = {
  doublecounted: true,
  methodology:
    'thBILL TVL is the value of the reserve assets held in the thBILL backing wallets: tokenized Treasury ' +
    'fund shares (ULTRA, FILQ-A), stablecoins, and stablecoin lending positions (Aave v3, Morpho vaults) ' +
    'across Ethereum, Arbitrum, Base, Monad and Solana. About 96% of thBILL supply is held as reserve by ' +
    'thUSD (see Theo Network thUSD), so this adapter is flagged doublecounted under the Theo Network parent.',
  hallmarks: [
    ['2025-11-20', 'Reserve rotated into ULTRA on Ethereum, Arbitrum and Solana'],
    ['2025-12-16', 'Aave v3 (Ethereum) added to reserve'],
    ['2026-06-25', 'FILQ-A (Fidelity USD Digital Liquidity Fund) added to reserve'],
    ['2026-08-06', 'Aave v3 on Monad added to reserve'],
    ['2026-09-04', 'Solana ULTRA redeemed; USDC proceeds pending'],
  ],
  ethereum: {
    tvl: sumTokensExport({
      owners: [BACKING, FILQ_WALLET],
      tokens: [
        ULTRA_ETH, FILQ_A,
        ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT,
        aEthUSDC, GTUSDCP, GTUSDTP, STEAKUSDT,
      ],
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: BACKING, tokens: [ULTRA_ARB, ADDRESSES.arbitrum.USDC_CIRCLE] }),
  },
  base: {
    tvl: sumTokensExport({ owner: BACKING, tokens: [ADDRESSES.base.USDC, GTUSDCP_BASE] }),
  },
  monad: {
    tvl: sumTokensExport({ owner: BACKING, tokens: [aMonUSDC, ADDRESSES.monad.USDC] }),
  },
  solana: {
    tvl: solanaTvl,
  },
}
