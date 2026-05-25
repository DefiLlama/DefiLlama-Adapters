const { getCuratorExport } = require("../helper/curators");
const { mergeExports } = require("../helper/utils");

const configs = getCuratorExport({
  methodology:
    "Count all assets deposited in all Euler vaults curated by AlphaGrowth.",
  blockchains: {
    base: {
      eulerVaultOwners: ["0x44102929B2248b1cefe2E65e9D580893B6D6823A"],
    },
    unichain: {
      eulerVaultOwners: ["0x8d9fF30f8ecBA197fE9492A0fD92310D75d352B9"],
    },
  },
});

// EulerDAO sunset its dao curated markets and handed several vaults to
// AlphaGrowth. Pre-sunset these vaults count under projects/euler-dao, from
// the sunset date onward they are attributed to AlphaGrowth.
// https://forum.euler.finance/t/sunsetting-of-dao-managed-market-and-vaults/1828
const eulerSunsetConfigs = getCuratorExport({
  start: "2026-05-06",
  blockchains: {
    ethereum: {
      euler: [
        // Frontier Falcon (creator 0x95058F3d4C69F14f6125ad4602E925845BD5d6A4)
        "0x3573A84Bee11D49A1CbCe2b291538dE7a7dD81c6", // Falcon USDC
        "0xbFdc482616787b420BC6C710212fE3167E7198e9", // Falcon USDT
        "0x412D0E31790D77b6e7a7872a9fd6967B6E640229", // Falcon USDf
        "0x2F849ba554C1ea2eDe9C240Bbe9d247dd6eC8A6B", // Falcon sUSDf
        "0xa7A064f56FbcA60cBeD47eD3e13C4B945DEf7eC3", // Falcon PT-USDf-29JAN2026
        "0xFBCc21fedd4C4e9097Ef1Baa65B7Ad386b59512D", // Falcon PT-sUSDf-29JAN2026
        // Frontier Apollo + Cap (creator 0x7594AeBEEfD14418342e1627aD3D67B4656943a6)
        "0x6Fe7Fa90756434645F0b0428fDff78E99Dda0FBc", // Cap USDC
        "0x35d4f830543700B7280084280ae3236f178E88e3", // Cap USDT
        "0x55F9bACE2C864aC0D3392Ea9fa654b605F21A3d3", // Cap cUSD
        "0xb7522C867B8AFae5e89638b59fb38f31B0821795", // Cap stcUSD
        "0x69a2fAD6AC96DDa502f7d240fB4EC88f85217705", // Cap PT-cUSD-29JAN2026
        "0x97C72647be549C6079dC95235271A9a0Fe7ECc21", // Cap PT-stcUSD-29JAN2026
        "0x2a356443FeE07703266066c6Bb1B11b82d8246AD", // mAPOLLO USDC
        "0xC11d6b78D8c609A6cbf66E89DBfea06b011B0AEf", // mAPOLLO USDT
        "0x49d9fd20f1d61648Fa9434a8c0C33174F5614eB8", // mAPOLLO mAPOLLO
        "0xF75D18F76859764aBe4D13cA2eBaCeFF0b90b262", // mAPOLLO PT-mAPOLLO-20NOV2025
        // creator 0x5304ebB378186b081B99dbb8B6D17d9005eA0448 
        "0xbD858DCee56Df1F0CBa44e6F5a469FbfeC0246cd", // Ethereum ARM ARM-WETH-stETH
        "0x2ff5F1Ca35f5100226ac58E1BFE5aac56919443B", // Ethereum WETH WETH
      ],
    },
    base: {
      euler: [
        "0x859160DB5841E5cfB8D3f144C6b3381A85A4b410", // Base WETH
        "0x7b181d6509DEabfbd1A23aF1E65fD46E89572609", // Base wstETH
        "0x358f25F82644eaBb441d0df4AF8746614fb9ea49", // Base cbETH
        "0xd4A805261B28f375fc9c3d89EcD2C952Cd130d14", // Base weETH
        "0x0A1a3b5f2041F33522C4efc754a7D096f880eE16", // Base USDC
        "0x882018411Bc4A020A879CEE183441fC9fa5D7f8B", // Base cbBTC
        "0x3f0d3Fd87A42BDaa3dfCC13ADA42eA922e638a7A", // Base LBTC
        "0x5Fe2DE3E565a6a501a4Ec44AAB8664b1D674ac25", // Base AERO
        "0xe72eA97aAF905c5f10040f78887cc8dE8eAec7E4", // YO yoBTC cbBTC
        "0xFab9aF50F7A1Cfe201CAE1c15fCFdDaE7705ccD3", // YO yoBTC yoBTC
        "0x085178078796Da17B191f9081b5E2fCCc79A7eE7", // YO yoUSD USDC
        "0x990d616ca6E7192625d1B7C41Fb67b5758DF7CF2", // YO yoUSD yoUSD
        "0x24D633664Aea3F551B2Fa34fA66Dd1BA52a33933", // YO yoUSD PT-yoUSD-26MAR2026
      ],
    },
    unichain: {
      euler: [
        "0x1f3134C3f3f8AdD904B9635acBeFC0eA0D0E1ffC", // Unichain WETH
        "0x54ff502df96CD9B9585094EaCd86AAfCe902d06A", // Unichain wstETH
        "0xe36DA4Ea4D07E54B1029eF26A896A656A3729f86", // Unichain weETH
        "0x6eAe95ee783e4D862867C4e0E4c3f4B95AA682Ba", // Unichain USDC
        "0xD49181c522eCDB265f0D9C175Cf26FFACE64eAD3", // Unichain USDT0
        "0x7650D7ae1981f2189d352b0EC743b9099D24086F", // Unichain sUSDC
        "0x5d2511C1EBc795F4394f7f659f693f8C15796485", // Unichain WBTC
      ],
    },
    linea: {
      euler: [
        "0xa8A02E6a894a490D04B6cd480857A19477854968", // Linea wstETH WETH
        "0x359e363c11fC619BE76EEC8BaAa01e61D521aA18", // Linea wstETH wstETH
        "0xF4712fC5E6483DE9e1Ff661D95DD686664327086", // Linea weETH WETH
        "0x8955d7dCdE9bD9694B64732aD28fF2113eb217B4", // Linea weETH weETH
      ],
    },
  },
});

module.exports = mergeExports([configs, eulerSunsetConfigs]);
