const { masterChefExports } = require("../helper/masterchef");

const chef = "0x30b65159dB82eFCf8CEde9861bc6B85336310EB2"
const meso = "0x4D9361A86D038C8adA3db2457608e2275B3E08d4"

module.exports = masterChefExports(chef, "fantom", meso)
