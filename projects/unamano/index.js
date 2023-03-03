const { get } = require("../helper/http")

async function getTvls() {
    const {amount} = await get('https://api.unamano.io/pool/release/totalAmount')
    return amount*1
}

async function getETHTvl() {
    return {
        ethereum: await getTvls(),
    }
}
module.exports = {
    timetravel: false,
    ethereum: {
        tvl: getETHTvl,
    },
    methodology: `We get the total staked amount and total staked USD from Unamano official API.`,
};
