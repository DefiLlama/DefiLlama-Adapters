const { pool2 } = require('../helper/pool2')
const { staking } = require('../helper/staking')

const xavaAddress = "0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4";
const stakingContracts = [
    "0xE82AAE7fc62547BdFC36689D0A83dE36FF034A68", // single staking
    "0xA6A01f4b494243d84cf8030d982D7EeB2AeCd329" // allocation proxy
];
const lp = "0x42152bDD72dE8d6767FE3B4E17a221D6985E8B25";
const farm = "0x6E125b68F0f1963b09add1b755049e66f53CC1EA";

async function tvl(){
    return {};
}
module.exports={
    methodology: "Within pool2, it counts the XAVA-AVAX staked in the farm",
    avax:{
        tvl,
        pool2: pool2(farm, lp),
        staking: staking(stakingContracts, xavaAddress)
    },
}
