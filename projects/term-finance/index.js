const { request, gql } = require("graphql-request");
const { getBlock } = require("../helper/http");
const BigNumber = require("bignumber.js");

const graphs = {
  ethereum:
    "https://api.studio.thegraph.com/query/33765/term-finance-mainnet/version/latest",
};

function addTokenBalance(balances, token, balance) {
  if (!balances[token]) {
    balances[token] = balance;
  } else {
    balances[token] = balances[token].plus(balance);
  }
}

function tvlPaged(chain) {
  return async (_, _b, { [chain]: block }) => {
    block = await getBlock(_, chain, { [chain]: block });
    const balances = {};
    const size = 1000;
    const graphQueryPaged = gql`
    query poolQuery($lastId: ID, $block: Int) {
      termRepoCollaterals(
        block: { number: $block },
        first: ${size},
        where: {
          id_gt: $lastId,
          term_: {
            delisted: false
          }
        }
      ) {
        id
        amountLocked
        collateralToken
      }
    }`;

    let lastId = "";
    let termRepoCollaterals = [];
    do {
      termRepoCollaterals = (await request(
        graphs[chain],
        graphQueryPaged,
        { lastId, block: block - 5000 }
      ))?.termRepoCollaterals;
      for (const collateral of termRepoCollaterals) {
        addTokenBalance(
          balances,
          collateral.collateralToken,
          new BigNumber(collateral.amountLocked)
        );
      }
      lastId = termRepoCollaterals[termRepoCollaterals.length - 1]?.id;
    } while (termRepoCollaterals && termRepoCollaterals.length === size);

    return balances;
  };
}

module.exports = {
  methodology: `Counts the collateral tokens locked in Term Finance's term repos.`,
  timetravel: false,
  // hallmarks: [[1588610042, "TermFinance Launch"]],
  ethereum: {
    tvl: tvlPaged("ethereum"),
  },
};
