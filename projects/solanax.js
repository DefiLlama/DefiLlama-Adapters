
module.exports = {
  misrepresentedTokens: true,
  methodology: `TVL is fetched by making calls to the Solanax API (https://solanax.org/api/data/)`,
  solana: {
      tvl: () => ({}),
  }
};

module.exports.deadFrom = '2023-02-09'