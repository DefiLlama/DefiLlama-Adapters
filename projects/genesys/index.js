const {addFundsInMasterChef} = require("../helper/masterchef");
const {pool2Exports} = require("../helper/pool2");
const {staking} = require("../helper/staking")

const token = "0xf8b234a1ce59991006930de8b0525f9013982746";
const masterchef = "0x18cD511b4ad613308Bd0C795e85Fbd8BE1a0aF94";

const ignore = [
    token,
    "0x692784Af9fe59B55A3D0E2a81a318bab88cf5B71",
    "0x325b358a1fC2024E2bdC63f656d9254b2Befc8F5"
]

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, masterchef, chainBlocks.fantom, "fantom", addr=>{
        addr = addr.toLowerCase();
        if (addr === "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e") {
            return "0x6b175474e89094c44da98b954eedeac495271d0f"
        }
        return `fantom:${addr}`
    }, undefined, ignore);
    return balances;
}

module.exports = {
    fantom: {
        tvl,
        staking: staking(masterchef, token, "fantom"),
        pool2: pool2Exports(masterchef, [ignore[1], ignore[2]], "fantom", addr=>`fantom:${addr}`)
    }
}