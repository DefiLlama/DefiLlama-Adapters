const {masterChefExports} = require("../helper/masterchef");

const masterchef = "0x61bA12f76F7993115Fcf86Fd6147008A6790589D";
const cbrdog = "0x7a6a832eB5F58245F7d75eD980cED849D69A98FD";

module.exports = {
    ...masterChefExports(masterchef, "cronos", cbrdog, false)
}