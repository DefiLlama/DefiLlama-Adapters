const iota = require('../helper/chain/iota')

async function tvl() {
    const nativePool = await iota.getObject('0x02d641d7b021b1cd7a2c361ac35b415ae8263be0641f9475ec32af4b9d8a8056');
    const iotaAmount = Number(BigInt(nativePool.fields.total_staked) / BigInt(10 ** 9));
    return {
        iota: iotaAmount,
    }
}

module.exports = {
    methodology: "Calculates the amount of IOTA staked in stIota liquid staking contracts.",
    timetravel: false,
    iota: {
        tvl,
    }
}