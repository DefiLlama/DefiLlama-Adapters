const sui = require("../helper/chain/sui");

const CREATED_EVENT = "0xc4bb66da17fec7444b7b3e2ac750e35ea6225f5cca936c423fad2c78245d987c::suipump::Created";

async function tvl(api) {
    const createdTokens = await sui.queryEvents({
        eventType: CREATED_EVENT,
        transform: e => {
            let tokenAddr = e.token_address
            if (!tokenAddr.startsWith("0x")) {
                tokenAddr = "0x" + tokenAddr
            }

            return {
                token: tokenAddr,
                owner: e.created_by
            }
        }
    })

    const tokens = createdTokens.map(e => e.token)
    const owners = createdTokens.map(e => e.owner)

    return await sui.sumTokens(
        {
            owners,
            tokens,
            api
        }
    )
}

module.exports = {
    sui: {
        tvl,
    },
}