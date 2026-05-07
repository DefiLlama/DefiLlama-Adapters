const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xBbE98D590d7eB99F4a236587f2441826396053d3";

const tokens = [
  nullAddress,
  "0x10393c20975cF177a3513071bC110f7962CD67da"
];

const ownTokens = [
  "0x51318B7D00db7ACc4026C88c3952B66278B6A67F", // PLS
  "0xD2826Cc00196d8aEe942A4a97D7987C66c17E7BB", // imxB
  "0x6CC0D643C7b8709F468f58F363d73Af6e4971515", // PLS-ETH SLP
  '0x8c1ea32448e09a59f36595abec6207c9ebd590a2', // PLUTUS
];

module.exports = treasuryExports({
    arbitrum: {
        tokens,
        owners: [treasury],
        ownTokens
    }
})
