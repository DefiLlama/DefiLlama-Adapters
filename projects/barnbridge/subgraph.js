const { request, gql } = require("graphql-request");

exports.getPastAndActiveTerms = async (url) => {
  const now = Math.floor(Date.now() / 1000);

  const query = gql`
    {
      terms(where: { end_gt: ${now} }) {
        id
        assetName
        assetSymbol
        assetDecimals
        underlying
        underlyingName
        underlyingSymbol
        underlyingDecimals
        start
        end
        depositCap
        feeRate
        realizedYield
        depositedAmount
        currentDepositedAmount
        liquidated
        txCount
        provider
        network
        nextTerm {
          id
        }
      }
    }
  `;

  const { terms } = await request(url, query);

  return terms;
};
