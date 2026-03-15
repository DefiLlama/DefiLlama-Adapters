const { sumTokensExport } = require("../helper/unwrapLPs");

const TREASURY_WALLET = "0x96A6cd06338eFE754f200Aba9fF07788c16E5F20";

// Treasury reserve assets
const CDCBTC = "0x2e53c5586e12a99d4CAE366E9Fc5C14fE9c6495d";  // Wrapped BTC on Cronos
const LCRO  = "0x9Fae23A2700FEeCd5b93e43fDBc03c76AA7C08A6";  // Liquid staked CRO
const CDCETH = "0x7a7c9db510aB29A2FC362a4c34260BEcB5cE3446"; // Wrapped ETH on Cronos
const USDC  = "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59";  // USDC on Cronos
const PACK  = "0x0d0b4a6FC6e7f5635C2FF38dE75AF2e96D6D6804";  // PACK ecosystem token

// Protocol own token
const CTR   = "0xF3672F0cF2E45B28AC4a1D50FD8aC2eB555c21FC";

module.exports = {
  methodology:
    "TVL is the USD value of all reserve assets (CDCBTC, LCRO, CDCETH, USDC, PACK) held in the CTR treasury wallet. " +
    "OwnTokens tracks CTR held in the treasury (tax proceeds awaiting conversion).",
  cronos: {
    tvl: sumTokensExport({
      owner: TREASURY_WALLET,
      tokens: [CDCBTC, LCRO, CDCETH, USDC, PACK],
    }),
    ownTokens: sumTokensExport({
      owner: TREASURY_WALLET,
      tokens: [CTR],
    }),
  },
};
