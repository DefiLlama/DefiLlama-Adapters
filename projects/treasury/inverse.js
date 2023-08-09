const ADDRESSES = require('../helper/coreAssets.json')
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
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.USDC,
      "0x865377367054516e17014CcdED1e7d814EDC9ce4", // DOLA
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.YFI,
      "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF", // AURA
      "0xba100000625a3754423978a60c9317c58a424e3D", // BAL
      "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F", // SDT
      ADDRESSES.ethereum.cvxFXS,
      ADDRESSES.ethereum.CRV,
      ADDRESSES.ethereum.CVX,
      "0x4C2e59D098DF7b6cBaE0848d66DE2f8A4889b9C3", // FODL
      ADDRESSES.ethereum.SAFE,
      "0x22915f309EC0182c85cD8331C23bD187fd761360", // DOLA USDC Stable Pool Aura Deposit Vault
      "0x7f50786A0b15723D741727882ee99a0BF34e3466", // Stake DAO sdCRV Gauge
      "0x445494F823f3483ee62d854eBc9f58d5B9972A25", // 50DOLA-50DBR
      "0xb204BF10bc3a5435017D3db247f56dA601dFe08A", // 50DOLA-50WETH
      "0x7e05540A61b531793742fde0514e6c136b5fbAfE", // xFODL
      "0xAD038Eb671c44b853887A7E32528FaB35dC5D710", // DBR
      "0x0a6B1d9F920019BAbc4De3F10c94ECB822106104",
      "0x73E02EAAb68a41Ea63bdae9Dbd4b7678827B2352",
      "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
    ],
    owners: [anchorTreasury, multisig, treasury1, treasury2],
    ownTokens: [
      inv,
      "0x73E02EAAb68a41Ea63bdae9Dbd4b7678827B2352", // Uniswap INV/ETH LP
      "0xA5D7A7690B72a89B7b720E43fC9cBda5419d0C71", // 50INV-50DOLA Aura Deposit Vault
      // "0x9c7305eb78a432ced5C4D14Cac27E8Ed569A2e26", // veNFT
    ],
    resolveUniV3: true,
    resolveLP: true,
  },
  optimism: {
    tokens: [
      nullAddress,
      ADDRESSES.optimism.USDC,
      "0x8aE125E8653821E851F12A49F7765db9a9ce7384", // DOLA
    ],
    owners: [opmultisig],
    ownTokens: [],
  },
  bsc: {
    tokens: [
      nullAddress,
      ADDRESSES.bsc.WBNB,
      "0x2F29Bc0FFAF9bff337b31CBe6CB5Fb3bf12e5840", // DOLA
      // "0xfBBF371C9B0B994EebFcC977CEf603F7f31c070D", // veTHE
    ],
    owners: [bnbmultisig],
    ownTokens: [],
  },
  arbitrum: {
    tokens: [
      nullAddress,
      ADDRESSES.arbitrum.DAI,
      "0xAAA6C1E32C55A7Bfa8066A6FAE9b42650F262418"
    ],
    owners: ["0x23dedab98d7828afbd2b7ab8c71089f2c517774a"],
    ownTokens: ["0x6A7661795C374c0bFC635934efAddFf3A7Ee23b6"],
  },
  polygon: {
    tokens: [
      nullAddress,
      ADDRESSES.polygon.USDC,
      
    ],
    owners: ["0x5d18b089e838dffbb417a87874435175f3a9b000"],
  },
});
