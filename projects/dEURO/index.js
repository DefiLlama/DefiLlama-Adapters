const { sumTokens2 } = require('../helper/unwrapLPs');
const { stakings } = require("../helper/staking");
const { cachedGraphQuery } = require('../helper/cache');

const GRAPHQL_ENDPOINT = "https://ponder.dEURO.com";

const POSITION_QUERY = `{
  positionV2s {
    items {
      position
      collateral
      collateralBalance
    }
  }
}`;

const MAINNET = {
  DecentralizedEURO: "0xbA3f535bbCcCcA2A154b573Ca6c5A49BAAE0a3ea",
  SavingsModule: "0x073493d73258C4BEb6542e8dd3e1b2891C972303", 
  Equity: "0xc71104001A3CCDA1BEf1177d765831Bd1bfE8eE6",
  EURSBridge: "0x0423F419De1c44151B6b000e2dAA51859C1D5d2A", 
  EURCBridge: "0xD03cD3ea55e67bC61b78a0d70eE93018e2182Dbe", 
  VEURBridge: "0x3Ed40fA0E5C803e807eBD51355E388006f9E1fEE",
  EURS:  "0xdB25f211AB05b1c97D595516F45794528a807ad8",
  EURC:  "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c",
  VEUR:  "0x6bA75D640bEbfe5dA1197bb5A2aff3327789b5d3",
  WFPS: "0x5052D3Cc819f53116641e89b96Ff4cD1EE80B182",
  FPS: "0x1bA26788dfDe592fec8bcB0Eaff472a42BE341B2",
  ZCHF: "0xB58E61C3098d85632Df34EecfB899A1Ed80921cB",
};

async function tvl(api) {
  const tokensAndOwners = [
    [MAINNET.EURS, MAINNET.EURSBridge],
    [MAINNET.EURC, MAINNET.EURCBridge],
    [MAINNET.VEUR, MAINNET.VEURBridge],
  ];

  const { positionV2s } = await cachedGraphQuery('dEURO', GRAPHQL_ENDPOINT, POSITION_QUERY);
  const wfpsPriceInZchf = await api.call({  abi: 'uint256:price', target: MAINNET.FPS}) // WFPS price = FPS price

  positionV2s?.items?.forEach(i => {
    if (parseInt(i.collateralBalance) > 0) {
      if (i.collateral?.toLowerCase() === MAINNET.WFPS.toLowerCase()) {
        const wfpsValueInZchf = BigInt(i.collateralBalance) * BigInt(wfpsPriceInZchf) / BigInt(10**18);
        api.add(MAINNET.ZCHF, wfpsValueInZchf);
      }
      tokensAndOwners.push([i.collateral, i.position])
    }
  });
  
  return sumTokens2({ api, tokensAndOwners, transformAddress: a => a.toLowerCase() === MAINNET.WFPS.toLowerCase() ? MAINNET.ZCHF : a });
}

module.exports = {
  methodology: "TVL consists of collateral tokens in the positions and source stablecoins in the bridge contracts. Staking includes dEURO tokens in the Savings module and Equity (nDEPS) contract.",
  ethereum: {
    tvl,
    staking: stakings([MAINNET.SavingsModule, MAINNET.Equity], MAINNET.DecentralizedEURO)
  },
  start: '2025-03-20'
};