const { calculateUniTvl } = require("../helper/calculateUniTvl");
const { stakingUnknownPricedLP } = require("../helper/staking");

const factory = "0xCC738D2fDE18fe66773b84c8E6C869aB233766D1"
const masterchef = "0x37b106f101a63D9d06e53140E52Eb6F8A3aC5bBc"
const wra = "0x4cf098d3775bd78a4508a13e126798da5911b6cd"

const translate = {
    "fantom:0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e": "0x6b175474e89094c44da98b954eedeac495271d0f",
    "fantom:0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8": "0x514910771af9ca656af840dff83e8264ecf986ca",
}

async function tvl(timestamp, block, chainBlocks) {
    let balances =  await calculateUniTvl(addr=>`fantom:${addr}`, chainBlocks.fantom, "fantom", factory, 0, true);
    for (key in translate) {
        balances[translate[key]] = balances[key];
        delete balances[key]
    }
    return balances
}

module.exports = {
    fantom: {
        tvl,
        staking: stakingUnknownPricedLP(masterchef, wra, "fantom", "0x6a80BD3eb550adcfF4f2f5f12a1bB213c1Ef57fA")
    }
}