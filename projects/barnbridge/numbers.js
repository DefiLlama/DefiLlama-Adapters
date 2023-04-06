const BigNumber = require("bignumber.js");
const { uniqBy, groupBy } = require("lodash");

const { poolByProvider } = require("./SmartYield.js");

const userDepositsForTerms = async (terms) => {
  const groupedUserDeposits = groupBy(terms, (term) => term.provider);

  const values = Object.entries(groupedUserDeposits).map(
    ([provider, terms]) => {
      const value = terms.reduce(
        (prev, term) => prev.plus(BigNumber(term.currentDepositedAmount)),
        BigNumber(0)
      );

      return { provider, value };
    }
  );

  return values;
};

const liquidityProviderBalancesForTerms = async (chain, terms) => {
  const values = await Promise.all(
    uniqBy(terms, "provider")
      .map((term) => term.provider)
      .map(async (provider) => {
        const liquidityProviderBalance = (await poolByProvider(chain, provider))
          .liquidityProviderBalance;

        const value = BigNumber(liquidityProviderBalance);

        return { provider, value };
      })
  );

  return values;
};

const totalValueLockedForTerms = async (chain, terms) => {
  const liquidityProviderBalances = await liquidityProviderBalancesForTerms(
    chain,
    terms
  );

  const userDeposits = await userDepositsForTerms(terms);

  const indexedLiquidityProviderBalances = Object.fromEntries(
    liquidityProviderBalances.map(({ provider, value }) => [provider, value])
  );

  const indexeduserDeposits = Object.fromEntries(
    userDeposits.map(({ provider, value }) => [provider, value])
  );

  const providers = uniqBy(terms, "provider").map((term) => ({
    provider: term.provider,
    underlying: term.underlying,
  }));

  const values = providers.map(({ provider, underlying }) => {
    return {
      underlying: underlying,
      value: indexedLiquidityProviderBalances[provider]
        .plus(indexeduserDeposits[provider])
        .toFixed(),
    };
  });

  return values;
};

module.exports = {
  totalValueLockedForTerms,
};
