const { request } = require("graphql-request");

const endpoint = "https://api.studio.thegraph.com/query/77016/wallet-mainnet/version/latest";

const securityAddress = '0x917991d52Aa2fC1b5612A6aa5e4e81d580F97532';
const query = `
query MyQuery {
  securities(where: {security: "${securityAddress}"}) {
    secondaryInvestors {
      amount
    }
  }
}
`;

async function tvl(api) {
  const data = await request(endpoint, query);

  const securities = data.securities || [];

  let tokens = 0;
  const currencyDecimal = 10 ** 18;

  securities.forEach(security => {
    security.secondaryInvestors.forEach(investor => {
      const amt = parseFloat(investor.amount);
      tokens += amt / currencyDecimal;
    });
  });

  const price = 100.5;
  const tvl = tokens * price
  api.addUSDValue(tvl);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "The value in RWA held by the protocol",
  hallmarks: [
    ['2025-01-13', 'ZTLN is deprecated'],
  ],
  deadFrom: "2025-01-13",
  ethereum: {
    tvl: () => ({}),
  },
};