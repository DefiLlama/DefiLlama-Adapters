const sui = require('../helper/chain/sui')

async function tvl() {
    const pool = await sui.getObject('0x15eda7330c8f99c30e430b4d82fd7ab2af3ead4ae17046fcb224aa9bad394f6b');
    const suiAmount = pool.fields.storage.fields.total_sui_supply / 10 ** 9
    return {
        sui: suiAmount,
    }
}

module.exports = {
            methodology: "Calculates the amount of SUI staked in SpringSui liquid staking contracts.",
    sui: {
        tvl,
    }
}
