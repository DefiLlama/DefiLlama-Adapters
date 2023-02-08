const { treasuryExports, nullAddress } = require("../helper/treasury");
const eth = "0x9d5df30f475cea915b1ed4c0cca59255c897b61b";
const op = "0xa283139017a2f5bade8d8e25412c600055d318f8";
const bsc = "0xf7da4bc9b7a6bb3653221ae333a9d2a2c2d5bda7";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F", // SDT
      "0xba100000625a3754423978a60c9317c58a424e3D", // BAL
      "0xD533a949740bb3306d119CC777fa900bA034cd52", // CRV
      "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B", // CVX
      "0x4C2e59D098DF7b6cBaE0848d66DE2f8A4889b9C3", // FODL
      "0x5aFE3855358E112B5647B952709E6165e1c1eEEe", // SAFE
    ],
    owners: [eth],
    ownTokenOwners: [eth],
    ownTokens: ["0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68"],
  },
  optimism: {
    tokens: [
      nullAddress,
      "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // USDC
      "0x139283255069Ea5deeF6170699AAEF7139526f1f", // OPTIDOGE
    ],
    owners: [op],
    ownTokenOwners: [op],
    ownTokens: [
      "0x8aE125E8653821E851F12A49F7765db9a9ce7384", // DOLA
    ],
  },
  bsc: {
    tokens: [
      nullAddress,
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
    ],
    owners: [bsc],
    ownTokenOwners: [bsc],
    ownTokens: [
      "0x2F29Bc0FFAF9bff337b31CBe6CB5Fb3bf12e5840", // DOLA
    ],
  },
});
