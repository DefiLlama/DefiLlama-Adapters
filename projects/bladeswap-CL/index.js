const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
    blast: {
        factory: "0xA87DbF5082Af26c9A6Ab2B854E378f704638CCa5",
        fromBlock: 4466565,
        isAlgebra: true,
        blacklistedTokens: [
            '0xD1FedD031b92f50a50c05E2C45aF1aDb4CEa82f4',
            '0xF8f2ab7C84CDB6CCaF1F699eB54Ba30C36B95d85',
        ]

    },
});
