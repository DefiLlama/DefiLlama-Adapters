const { sumTokens2 } = require('../helper/unwrapLPs');
const { stakings } = require("../helper/staking");
const { cachedGraphQuery } = require('../helper/cache');

const MAINNET = {
  DecentralizedEURO: "0xbA3f535bbCcCcA2A154b573Ca6c5A49BAAE0a3ea",
  SavingsModule: "0x073493d73258C4BEb6542e8dd3e1b2891C972303", 
  Equity: "0xc71104001A3CCDA1BEf1177d765831Bd1bfE8eE6",
  Bridges: {
    VEUR: "0x3Ed40fA0E5C803e807eBD51355E388006f9E1fEE",
    EURT: "0x2353D16869F717BFCD22DaBc0ADbf4Dca62C609f",
    EURS: "0x0423F419De1c44151B6b000e2dAA51859C1D5d2A",
    EURC: "0xD03cD3ea55e67bC61b78a0d70eE93018e2182Dbe"
  }
};

const GRAPHQL_ENDPOINT = "https://ponder.dEURO.com";

async function tvl(api) {
  const tokensAndOwners = [];
  
  const positionQuery = `{
    positionV2s {
      items {
        position
        collateral
        collateralBalance
      }
    }
  }`;

  const { positionV2s } = await cachedGraphQuery('dEURO', GRAPHQL_ENDPOINT, positionQuery);

  // Add collateral tokens in positions
  positionV2s?.items?.forEach(i => {
    if (parseInt(i.collateralBalance) > 0) {
      tokensAndOwners.push([i.collateral, i.position]);
    }
  });

  // Add bridge tokens
  const bridgeAddresses = Object.values(MAINNET.Bridges);
  for (const bridgeAddress of bridgeAddresses) {
    try {
      const sourceStablecoin = await api.call({
        abi: 'function eur() view returns (address)',
        target: bridgeAddress
      });
      
      tokensAndOwners.push([sourceStablecoin, bridgeAddress]);
    } catch (error) {
      console.log(`Error fetching source stablecoin for bridge ${bridgeAddress}: ${error.message}`);
    }
  }

  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  methodology: "TVL consists of collateral tokens in positions + source stablecoins in bridge contracts. Staking includes dEURO tokens in the Savings module and Equity (nDEPS) contract.",
  ethereum: {
    tvl,
    staking: stakings([MAINNET.SavingsModule, MAINNET.Equity], MAINNET.DecentralizedEURO)
  },
  start: '2025-03-20'
};