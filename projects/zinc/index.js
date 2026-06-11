const { sumTokensExport } = require("../helper/solana");

const STAKED_ZINC_TOKEN_ACCOUNT = "4Ym9uvwrwdpiTKq874T8wSqzaFkh8AVazf255FKLt9MR";
const STOCKPILE_SOL_VAULT = "8RxMJD7BtdzxuZkmDqcxhR6gWvegLJ1GNf9NFrPkCmwf";
const BONANZA_SOL_VAULT = "DNJGqahXJfu8Fsg4HRS7bKWFLnSzU5fvt85fkake7JFY";

module.exports = {
  timetravel: false,
  start: "2026-05-26",
  methodology:
    "TVL counts SOL held in Zinc stockpile and bonanza prize vaults. Staking counts ZINC deposited in the staking vault. Treasury and buyback vault balances are excluded.",
  solana: {
    tvl: sumTokensExport({solOwners: [STOCKPILE_SOL_VAULT, BONANZA_SOL_VAULT]}),
    staking: sumTokensExport({tokenAccounts: [STAKED_ZINC_TOKEN_ACCOUNT]}),
  },
};
