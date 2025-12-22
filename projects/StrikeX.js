const { masterChefExports } = require("./helper/masterchef")

const masterchef = "0x5867Cd4F7e105878AfbC903505c207eb7b130A50";
const token = "0xd6fdde76b8c1c45b33790cc8751d5b88984c44ec"

module.exports = masterChefExports(masterchef, "bsc", token)

