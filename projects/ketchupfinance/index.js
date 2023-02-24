const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0x7bBcD33415984b820D31BBda6339E55A03b5F8cA";
const token = "0x5D266f324Eb3DD753fF828fA45d80F09D7C75dff";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "bsc", token, false)
}