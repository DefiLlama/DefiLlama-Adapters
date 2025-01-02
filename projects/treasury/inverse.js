const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const inv = "0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68";
const anchorTreasury = "0x926df14a23be491164dcf93f4c468a50ef659d5b";
const treasurymultisig = "0x9D5Df30F475CEA915b1ed4C0CCa59255C897b61B";
const opmultisig = "0xa283139017a2f5bade8d8e25412c600055d318f8";
const bnbmultisig = "0xf7da4bc9b7a6bb3653221ae333a9d2a2c2d5bda7";
const basemultisig = "0x586CF50c2874f3e3997660c0FD0996B090FB9764";
const arbmultisig = "0x233Ca46D4882609C53fcbD2FCFaAe92D2eA89538";
const arbmultisig2 = "0x23dEDab98D7828AFBD2B7Ab8C71089f2C517774a";
const polmultisig = "0x5D18b089e838DFFbb417A87874435175F3A9B000";
const avaxmultisig = "0x1A927B237a57421C414EB511a33C4B82C2718677";
const pcmultisig = "0x4b6c63e6a94ef26e2df60b89372db2d8e211f1b7"
const bugbountymultisig = "0x943dbdc995add25a1728a482322f9b3c575b16fb"
const fedchair = "0x8f97cca30dbe80e7a8b462f1dd1a51c32accdfc8"

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
      "0xf24d8651578a55b0c119b9910759a351a3458895", // sdBAL
      "0x445494F823f3483ee62d854eBc9f58d5B9972A25", // 50DOLA-50DBR
      "0xb204BF10bc3a5435017D3db247f56dA601dFe08A", // 50DOLA-50WETH
      "0x7e05540A61b531793742fde0514e6c136b5fbAfE", // xFODL      
      "0x0a6B1d9F920019BAbc4De3F10c94ECB822106104",
      "0x73E02EAAb68a41Ea63bdae9Dbd4b7678827B2352",
      "0xbD1F921786e12a80F2184E4d6A5cAcB25dc673c9", // dola-inv uni
    ],
    owners: [anchorTreasury, treasurymultisig, pcmultisig, bugbountymultisig, fedchair],
    ownTokens: [
      inv,
      "0xAD038Eb671c44b853887A7E32528FaB35dC5D710", // DBR
      "0x73E02EAAb68a41Ea63bdae9Dbd4b7678827B2352", // Uniswap INV/ETH LP
      "0xA5D7A7690B72a89B7b720E43fC9cBda5419d0C71", // 50INV-50DOLA Aura Deposit Vault      
    ],
    resolveUniV3: true,
    resolveLP: true,
    blacklistedTokens: [
      '0x21e83dbfd8f11d885eba9f9ba126da11ae0671b7',
      '0x265befe2b1a0f4f646dea96ba09c1656b74bda91',
    ],
    convexRewardPools: [
      "0x9a2d1b49b7c8783E37780AcE4ffA3416Eea64357",// DBR tripool CVX
      "0x21E2d7f66DF6F4e8199210b9490a51831C9847C7",// inv tripool CVX
      "0xE8cBdBFD4A1D776AB1146B63ABD1718b2F92a823",// dola-fraxpyusd lp CVX
      "0x2ef1dA0368470B2603BAb392932E70205eEb9046",// dola-fxusd lp CVX
      "0x0404d05F3992347d2f0dC3a97bdd147D77C85c1c",// dola-fraxusdc lp CVX
    ],
    auraPools: [
      // "0xA36d3799eA28f4B75653EBF9D91DDA4519578086", // sDOLA-DOLA aura pool
    ], 
    blacklistedLPs: [
      '0xcb79637aaffdc1e8db17761fa10367b46745ecb0'
    ]
  },
  optimism: {
    tokens: [
      nullAddress,
      ADDRESSES.optimism.USDC,
      ADDRESSES.optimism.USDC_CIRCLE,
      "0x8aE125E8653821E851F12A49F7765db9a9ce7384", // DOLA      
      "0x9560e827af36c94d2ac33a39bce1fe78631088db", // VELO      
    ],
    solidlyVeNfts: [
      { baseToken: "0x9560e827af36c94d2ac33a39bce1fe78631088db", veNft: "0xFAf8FD17D9840595845582fCB047DF13f006787d" },// veVelo
    ],
    owners: [opmultisig],
    ownTokens: [],
  },
  base: {
    tokens: [
      nullAddress,
      ADDRESSES.base.USDC,
      ADDRESSES.base.USDbC,
      "0x4621b7A9c75199271F773Ebd9A499dbd165c3191", // DOLA      
      "0x940181a94A35A4569E4529A3CDfB74e38FD98631", // AERO
    ],
    solidlyVeNfts: [
      { baseToken: "0x940181a94A35A4569E4529A3CDfB74e38FD98631", veNft: "0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4" },// veVelo
    ],
    owners: [basemultisig],
    ownTokens: [],
  },
  bsc: {
    tokens: [
      nullAddress,
      ADDRESSES.bsc.WBNB,
      "0x2F29Bc0FFAF9bff337b31CBe6CB5Fb3bf12e5840", // DOLA      
      "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11", // THENA
    ],
    solidlyVeNfts: [
      { isAltAbi: true, baseToken: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11", veNft: "0xfBBF371C9B0B994EebFcC977CEf603F7f31c070D" },// veTHENA
    ],
    owners: [bnbmultisig],
    ownTokens: [],
  },
  avax: {
    tokens: [
      nullAddress,
      ADDRESSES.avax.USDC,
      '0x221743dc9E954bE4f86844649Bf19B43D6F8366d', // DOLA
      '0xeeee99b35Eb6aF5E7d76dd846DbE4bcc0c60cA1d', // SNEK      
    ],
    solidlyVeNfts: [
      { isAltAbi: true, baseToken: "0xeeee99b35Eb6aF5E7d76dd846DbE4bcc0c60cA1d", veNft: "0xeeee3Bf0E550505C0C17a8432065F2f6b9D06350" },// veSNEK   
    ],
    owners: [avaxmultisig],
    ownTokens: [],
  },
  arbitrum: {
    tokens: [
      nullAddress,
      ADDRESSES.arbitrum.DAI,
      ADDRESSES.arbitrum.ARB,
      ADDRESSES.arbitrum.WETH,
      "0xAAA6C1E32C55A7Bfa8066A6FAE9b42650F262418", // RAM      
    ],    
    solidlyVeNfts: [
      { isAltAbi: true, baseToken: "0xAAA6C1E32C55A7Bfa8066A6FAE9b42650F262418", veNft: "0xAAA343032aA79eE9a6897Dab03bef967c3289a06" },// veRAM
      { isAltAbi: true, baseToken: "0x5DB7b150c5F38c5F5db11dCBDB885028fcC51D68", veNft: "0x450330Df68E1ed6e0683373D684064bDa9115fEe" },// veSTR
      { isAltAbi: true, baseToken: "0x463913D3a3D3D291667D53B8325c598Eb88D3B0e", veNft: "0x29d3622c78615A1E7459e4bE434d816b7de293e4" },// veSLIZ
      { hasTokensOfOwnerAbi: true, baseToken: "0x15b2fb8f08E4Ac1Ce019EADAe02eE92AeDF06851", veNft: "0x9A01857f33aa382b1d5bb96C3180347862432B0d" },// veCHRONOS
    ],
    owners: [arbmultisig2, arbmultisig],
    ownTokens: [],
  },
  polygon: {
    tokens: [
      nullAddress,
      ADDRESSES.polygon.USDC,
      '0xbC2b48BC930Ddc4E5cFb2e87a45c379Aab3aac5C', // DOLA
    ],    
    owners: [polmultisig],
  },
});
