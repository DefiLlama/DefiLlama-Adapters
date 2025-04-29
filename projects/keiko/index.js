const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

// Correct contract addresses
const voAddress = '0x67e70761E88C77ffF2174d5a4EaD42B44Df3F64a'; // Vault Operations
const priceFeedAddress = '0x689eca147677167bc86503D90D75b8943089040f'; // Price Feed

// Collateral token addresses
const validCollaterals = [
  ADDRESSES.hyperliquid.WHYPE, // HYPE
  ADDRESSES.hyperliquid.wstHYPE, // wstHYPE
  '0x5748ae796AE46A4F1348a1693de4b50560485562', // LHYPE
  '0x9b498C3c8A0b8CD8BA1D9851d40D186F1872b44E',  // PURR
  '0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463' // UBTC
];

const balanceOfAbi = "function balanceOf(address account) view returns (uint256)";
const fetchPriceAbi = "function fetchPrice(address token) view returns (uint256)";
const decimalsAbi = "function decimals() view returns (uint8)";

async function tvl(timestamp, block, chainBlocks, { api }) {
  const collateralBalancesPromises = validCollaterals.map(collateral => 
    api.call({
      target: collateral,
      abi: balanceOfAbi,
      params: [voAddress],
    })
  );
  
  const collateralBalances = await Promise.all(collateralBalancesPromises);
  
  for (let i = 0; i < validCollaterals.length; i++) {
    const collateral = validCollaterals[i];
    const balance = collateralBalances[i];
    
    api.add(collateral, balance);
  }
  
  return api.getBalances();
}

module.exports = {
  hyperliquid: {
    tvl
  },
  methodology: "TVL consists of HYPE, wstHYPE, LHYPE, PURR and UBTC tokens deposited as collateral to mint KEI stablecoin in the protocol's vaults",
  start: 1739958540,
  timetravel: true,
  hallmarks: [
    [1739958540, "Protocol Launch"]
  ]
};