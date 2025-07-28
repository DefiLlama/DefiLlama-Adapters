const { sumTokens } = require("../helper/chain/elrond");
const { get } = require("../helper/http");

const fundsOwnerSc =
    "erd1qqqqqqqqqqqqqpgqqvj2zrdfv4lsc38p8cvh4e0yd4av6njfu7zsj7ztzl";

async function getFunds(address) {
    const fundsScs = await get(`https://api.multiversx.com/accounts/${address}/contracts`);
    return fundsScs
}

async function tvl() {
    const funds = await getFunds(fundsOwnerSc);
    const owners = [
        ...funds.map(fund => fund.address)
      ];

    return sumTokens({ owners });
}

module.exports = {
    timetravel: false,
    elrond: {
        tvl,
    },
};
