const { sumTokens } = require("../helper/chain/elrond");
const { get } = require("../helper/http");

const fundsOwnerScAddress =
    "erd1qqqqqqqqqqqqqpgqqvj2zrdfv4lsc38p8cvh4e0yd4av6njfu7zsj7ztzl";

async function getFundScs(address) {
    const fundsScs = await get(`https://api.multiversx.com/accounts/${address}/contracts`);
    return fundsScs
}

async function tvl() {
    const fundScs = await getFundScs(fundsOwnerScAddress);
    const fundsAddresses = [...fundScs.map(fund => fund.address)];
    
    return sumTokens({ fundsAddresses });
}

module.exports = {
    timetravel: false,
    elrond: {
        tvl,
    },
};
