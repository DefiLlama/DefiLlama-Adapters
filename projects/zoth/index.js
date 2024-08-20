const { graphQuery } = require('../helper/http')

const subgraphUrl = 'https://api.studio.thegraph.com/proxy/77016/wallet-base/version/latest';
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

async function getData(api) {
    return graphQuery(subgraphUrl, query, {}, { api, })
}

async function tvl(api) {
    let total = 0
    const res = await getData(api)

    res.securities[0].secondaryInvestors.map((item) => {
        total = total + Number(item.amount)
    })

    return {
        ["base"]: total / (10 ** 18)
    }
}

module.exports = {
    timetravel: false,
    base: {
        tvl,
    }
}