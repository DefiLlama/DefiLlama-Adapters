const { treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
    bsc: {
        tokens: [
            "0xF1c599E9A5FBDEA408a7409C0176a2fE42C64444", // hachiko inu
            "0x2789033DFE80593f69d689f65892a75aFA491111", // white monkey
            "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", // binance peg link
        ],
        ownTokens: ["0x330f4fe5ef44b4d0742fe8bed8ca5e29359870df"], // jade
        owners: ["0x62c71392c796b92dFe62aCba30293A60771450b0"], // treasury
    },
});