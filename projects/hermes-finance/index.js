const { staking } = require('../helper/staking');
const { pool2Exports } = require('../helper/pool2');

const hermes = "0xB15f02F9Da8CD1f99E9dd375F21dc96D25ddd82C";
const hermesShares = "0xfa4b6db72a650601e7bd50a0a9f537c9e98311b2";
const hShareRewardPool = "0xDDd0A62D8e5AFeccFB334e49D27a57713DD0fBcc";
const olympus = "0x02662d2079a3218275bdA1Adf812ab5e324a5b27";

const pool2LPs = [
    "0xc58cc1a0f29f1993d089681e4fa03c7f65df1325", // HERMES-WAVAX PGL
    "0xC132ff3813De33356C859979501fB212673e395e" // HSHARE-WAVAX PGL
]

module.exports = {
    avax:{
        tvl: async () => ({}),
        staking: staking(olympus, hermesShares),
        pool2: pool2Exports(hShareRewardPool, pool2LPs, "avax")
    }
}