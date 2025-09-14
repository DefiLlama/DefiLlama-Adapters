const {getObject} = require("../helper/chain/sui");

// Btcvc is a wrapper token used by Vishva to map btc assets onto the sui chain
const BTCvc_treasuryCap = "0xfd921a8aa19106f543038588299071de0ad988fb1cb3f982c1633024a8eb304c";

async function tvl(api) {
    const obj = await getObject(BTCvc_treasuryCap);
    const totalSupplyStr = obj?.fields?.total_supply?.fields?.value ?? "0";
    const totalSupply = Number(totalSupplyStr) / 1e8;
    return {
        ['bitcoin']: Number(totalSupply),
    }
}

module.exports = {
    methodology: "Calculate all the custodial assets of Vishwa on the chain",
}

module.exports = {
    bitcoin: {
        tvl
    }
}
