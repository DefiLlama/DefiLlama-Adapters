const { sumTokensExport } = require('../helper/solana')

// TRUE DEX (https://app.truefinance.ai/perps): perpetuals venue on Solana.
// Trading collateral is USDC held by the verifier program
// ttaiNybR4ncnBFsBCQKdVus8BNHepErToRp5cuULduL in its custody token account:
// the USDC ATA of the ["custody_authority"] PDA FgAsLXd1S6LY6masqLFPgcPSeGjgMQpFeTh8PmeRG9fD.
const CUSTODY_USDC_TOKEN_ACCOUNT = 'A5GTSUyjFSfsQWwRESSa1UtxciFY6g6guBvM12Tee1ag'

module.exports = {
  methodology: 'USDC deposited as perpetuals trading collateral, read from the verifier custody token account on Solana.',
  solana: { tvl: sumTokensExport({ tokenAccounts: [CUSTODY_USDC_TOKEN_ACCOUNT] }) },
}
