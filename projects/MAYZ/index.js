const { sumTokens2 } = require('../helper/chain/cardano');

const PROTOCOL_FUNDS_ADDRESS = "addr1wxlgzwu4vr5h75ndr523unyqrsq6g455uhudps02h403t4qkjud9l";
const GOVERNANCE_STAKING_ADDRESS = "addr1wxn9kx9w0gjzfkyuejqtt834z04gd9yrans6hy0xt5vunpslcg4j7";

async function tvl() {
    return sumTokens2({ owner: PROTOCOL_FUNDS_ADDRESS });
}

function stake() {
    return sumTokens2({ owner: GOVERNANCE_STAKING_ADDRESS });
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl,
        staking: stake
    },
};