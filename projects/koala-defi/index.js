const { addFundsInMasterChef } = require("../helper/masterchef");
const { stakingUnknownPricedLP } = require("../helper/staking");
const { pool2BalanceFromMasterChefExports } = require("../helper/pool2");

const bscNalis = "0xb2ebaa0ad65e9c888008bf10646016f7fcdd73c3";
const bscMC = "0x7b3cA828e189739660310B47fC89B3a3e8A0E564";
const polyNalis = "0x04f2e3ec0642e501220f32fcd9e26e77924929a9";
const polyMC = "0xf6948f00FC2BA4cDa934C931628B063ed9091019";

async function bscTvl (timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, bscMC, chainBlocks.bsc, "bsc", addr=>`bsc:${addr}`, undefined, [bscNalis], true, true, bscNalis);
    return balances;
}

async function polyTvl (timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, polyMC, chainBlocks.polygon, "polygon", addr=>`polygon:${addr}`, undefined, [polyNalis], true, true, polyNalis);
    return balances;
}

module.exports = {
    bsc: {
        tvl: bscTvl,
        staking: stakingUnknownPricedLP(bscMC, bscNalis, "bsc", "0x138ACb44F9f2e4E7F3bbcB7BBb1a268068dC202C"),
        pool2: pool2BalanceFromMasterChefExports(bscMC, bscNalis, "bsc", addr=>`bsc:${addr}`)
    },
    polygon: {
        tvl: polyTvl,
        staking: stakingUnknownPricedLP(polyMC, polyNalis, "polygon", "0xff50A77412997FC86e78178A4b47000b9225ffd9"),
        pool2: pool2BalanceFromMasterChefExports(polyMC, polyNalis, "polygon", addr=>`polygon:${addr}`)
    }
}