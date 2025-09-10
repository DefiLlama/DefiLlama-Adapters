const { getAdaInAddress } = require('../helper/chain/cardano')

// Offers V1 Contract
const V1_PROTOCOL_SCRIPT_ADDRESS_OFFER = "addr1zxj47sy4qxlktqzmkrw8dahe46gtv8seakrshsqz26qnvzypw288a4x0xf8pxgcntelxmyclq83s0ykeehchz2wtspksr3q9nx";

// Ask V1 Contract
const V1_PROTOCOL_SCRIPT_ADDRESS_ASK = "addr1x8rjw3pawl0kelu4mj3c8x20fsczf5pl744s9mxz9v8n7efvjel5h55fgjcxgchp830r7h2l5msrlpt8262r3nvr8ekstg4qrx";

// BuySell V2 Contract 
const V2_PROTOCOL_SCRIPT_ADDRESS_MAIN = "addr1w999n67e86jn6xal07pzxtrmqynspgx0fwmcmpua4wc6yzsxpljz3";

// Offers V2 Contract
const V2_PROTOCOL_SCRIPT_ADDRESS_OFFER = "addr1zxgx3far7qygq0k6epa0zcvcvrevmn0ypsnfsue94nsn3tvpw288a4x0xf8pxgcntelxmyclq83s0ykeehchz2wtspks905plm";

async function tvl() {
    const V1Locked_Offer = await getAdaInAddress(V1_PROTOCOL_SCRIPT_ADDRESS_OFFER)
    const V1Locked_Ask = await getAdaInAddress(V1_PROTOCOL_SCRIPT_ADDRESS_ASK)
    const V2Locked_Main = await getAdaInAddress(V2_PROTOCOL_SCRIPT_ADDRESS_MAIN)
    const V2Locked_Offer = await getAdaInAddress(V2_PROTOCOL_SCRIPT_ADDRESS_OFFER)
    return {
        "cardano": V1Locked_Offer + V1Locked_Ask + V2Locked_Main + V2Locked_Offer
    }
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl
    }
}
