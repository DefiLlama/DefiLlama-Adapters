const {addHBarBalance} = require("../helper/chain/hbar");

const ACTIVE_POOL_CONTRACT = '0x00000000000000000000000000000000005c9f0b';
const timestamp = Math.floor(Date.now() / 1000);
async function tvl(api) {
    const balance = await addHBarBalance({ address: ACTIVE_POOL_CONTRACT, timestamp });
    return {'hedera-hashgraph': balance['hedera-hashgraph']}
}

module.exports = {
    methodology: 'the amount of locked hbar in the HLiquity protocol',
    hedera: {
        tvl,
    }
};
