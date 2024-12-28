const { call } = require("../helper/chain/icx")

const stakingContract = "cx43e2eec79eb76293c298f2b17aec06097be606e0"
const sIcxTokenContract = "cx2609b924e33ef00b648a409245c7ea394c467824"

async function getTotalClaimableIcx() {
    let response = await call(stakingContract, 'totalClaimableIcx', {},{ parseInt: true })
    return response / 10 ** 18
}

async function getTotalSupply() {
    let response = await call(sIcxTokenContract, 'totalSupply', {}, { parseInt: true })
    return response / 10 ** 18
}

async function fetch() {

    let totalClaimableIcx = await getTotalClaimableIcx();
    let totalSupply = await getTotalSupply();
    // tvl = ICX/USD Price * (totalClaimableIcx + totalSupply from sICX token SCORE * getTodayRate)
    const tvl = totalClaimableIcx + totalSupply;
    return { 'icon': tvl }
}

module.exports = {
    timetravel: false,
    icon: { tvl: fetch },
}
