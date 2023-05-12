const { treasuryExports, nullAddress } = require("../helper/treasury");

const inv = "0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68";
const anchorTreasury = "0x926df14a23be491164dcf93f4c468a50ef659d5b";
const multisig = "0x9D5Df30F475CEA915b1ed4C0CCa59255C897b61B";
const opmultisig = "0xa283139017a2f5bade8d8e25412c600055d318f8";
const bnbmultisig = "0xf7da4bc9b7a6bb3653221ae333a9d2a2c2d5bda7";
const treasury1 = "0x4b6c63e6a94ef26e2df60b89372db2d8e211f1b7"
const treasury2 = "0x943dbdc995add25a1728a482322f9b3c575b16fb"

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      "0x865377367054516e17014CcdED1e7d814EDC9ce4", // DOLA
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
      "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", // YFI
      "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF", // AURA
      "0xba100000625a3754423978a60c9317c58a424e3D", // BAL
      "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F", // SDT
      "0xFEEf77d3f69374f66429C91d732A244f074bdf74", // cvxFXS
      "0xD533a949740bb3306d119CC777fa900bA034cd52", // CRV
      "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B", // CVX
      "0x4C2e59D098DF7b6cBaE0848d66DE2f8A4889b9C3", // FODL
      "0x5aFE3855358E112B5647B952709E6165e1c1eEEe", // SAFE
      "0x22915f309EC0182c85cD8331C23bD187fd761360", // DOLA USDC Stable Pool Aura Deposit Vault
      "0x7f50786A0b15723D741727882ee99a0BF34e3466", // Stake DAO sdCRV Gauge
      "0x445494F823f3483ee62d854eBc9f58d5B9972A25", // 50DOLA-50DBR
      "0xb204BF10bc3a5435017D3db247f56dA601dFe08A", // 50DOLA-50WETH
      "0x7e05540A61b531793742fde0514e6c136b5fbAfE", // xFODL
      "0xAD038Eb671c44b853887A7E32528FaB35dC5D710", // DBR
    ],
    owners: [anchorTreasury, multisig, treasury1, treasury2],
    ownTokens: [
      inv,
      "0x73E02EAAb68a41Ea63bdae9Dbd4b7678827B2352", // Uniswap INV/ETH LP
      "0xA5D7A7690B72a89B7b720E43fC9cBda5419d0C71", // 50INV-50DOLA Aura Deposit Vault
      // "0x9c7305eb78a432ced5C4D14Cac27E8Ed569A2e26", // veNFT
    ],
    resolveUniV3: true,
  },
  optimism: {
    tokens: [
      nullAddress,
      "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // USDC
      "0x8aE125E8653821E851F12A49F7765db9a9ce7384", // DOLA
    ],
    owners: [opmultisig],
    ownTokens: [],
  },
  bsc: {
    tokens: [
      nullAddress,
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
      "0x2F29Bc0FFAF9bff337b31CBe6CB5Fb3bf12e5840", // DOLA
      // "0xfBBF371C9B0B994EebFcC977CEf603F7f31c070D", // veTHE
    ],
    owners: [bnbmultisig],
    ownTokens: [],
  },
});
