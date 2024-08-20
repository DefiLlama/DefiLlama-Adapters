const { request } = require("graphql-request");

const endpoint = "https://api.studio.thegraph.com/proxy/77016/wallet-base/version/latest";

const securityAddress = '0x07E4826972da11Ccb99A100A6cC3d596a2143549';
const query = `
query MyQuery {
  securities(where: {security: "${securityAddress}"}) {
    secondaryInvestors {
      amount
    }
  }
}
`;

async function getTvl() {
  try {
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
    const tvl = tokens * price;

    // console.log("tvl", tvl);
    return tvl;
  } catch (error) {
    console.error("Error fetching TVL:", error);
    return 0;
  }
}

module.exports = {
  timetravel: false,
  base: {
    fetch: getTvl
  },
  fetch: getTvl
};