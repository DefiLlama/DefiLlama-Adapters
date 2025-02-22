const ADDRESSES = require("../helper/coreAssets.json");
const { getLogs2 } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { nullAddress } = require("../helper/tokenMapping");

// Bonding Curves PumpFactory
const PUMP_FACTORY = '0x0fDc7bf21a167A20C49FcA41CCbc3ABa354AcfbD';

async function tvl(api) {
  try {
    // Bonding Curves contracts
    const tokenCreatedLogs = await getLogs2({
      api,
      factory: PUMP_FACTORY,
      eventAbi: 'event TokenCreated(address indexed token, address indexed bondingCurve)',
      fromBlock: 1895173, // PumpFactory creation block time
    });

    // Safely map bonding curves, handling potential undefined values
    const bondingsCurves = tokenCreatedLogs
      .map(log => log?.bondingCurve ? [nullAddress, log.bondingCurve] : null)
      .filter(Boolean);

    // Safely get completed Bonding Curves Pools liquidity
    const lps = await Promise.all(
      bondingsCurves.map(curve => 
        getLogs2({
          api,
          factory: curve[1], // [1] is the bondingCurve address
          eventAbi: 'event BondingCurveComplete(address indexed tokenAddress, address indexed liquidityPoolAddress)',
          fromBlock: 1895173,
        })
      )
    );
    const liquidityPools = lps
      .flat()
      .map(log => log?.liquidityPoolAddress 
        ? [ADDRESSES.formnetwork.WETH, log.liquidityPoolAddress] 
        : null
      )
      .filter(Boolean);

    // Combine bonding curves and liquidity pools for token balance calculation
    const tokensAndOwners = [...bondingsCurves, ...liquidityPools];

    const balances = await sumTokens2({
      tokensAndOwners,
      api
    });
    
    return balances;
  } catch (error) {
    console.error("Error in TVL calculation:", error);
    return {};
  }
}

module.exports = {
  methodology: 'We count the ETH locked in the Bonding Curves contracts and WETH/Token Completed Bonding Curves Liquidity Pools',
  misrepresentedTokens: true,
  formnetwork: {
    tvl
  }
}
