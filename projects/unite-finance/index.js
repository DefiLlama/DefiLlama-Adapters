const sdk = require("@defillama/sdk");
const { transformHarmonyAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { fixHarmonyBalances } = require('../helper/portedTokens')

const uniteTokenAddress = "0xB4441013EA8aA3a9E35c5ACa2B037e577948C59e";
const ushareTokenAddress = "0xd0105cff72a89f6ff0bd47e1209bf4bdfb9dea8a";

const uniteOneLpAddress = "0xa0377f9fd3de5dfefec34ae4807e9f2b9c56d534";
const ushareOneLpAddress = "0x6372d14d29f07173f4e51bb664a4342b4a4da9e8";

const boardroomAddress = "0x68BeEc29183464e2C80Aa9B362db8b0c0eB826bd";
const ushareRewardPoolAddress = "0xe3F4E2936F0Ac4104Bd6a58bEbd29e49437710Fe";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  let lpPositions = [];
  let transformAddress = await transformHarmonyAddress();

  // Masonry TVL
  const boardroomBalance = sdk.api.erc20
    .balanceOf({
      target: ushareTokenAddress,
      owner: boardroomAddress,
      block: chainBlocks["harmony"],
      chain: "harmony",
    });
  sdk.util.sumSingleBalance(
    balances,
    transformAddress(ushareTokenAddress),
    (await boardroomBalance).output
  );

  // Cemetery TOMB-FTM LP TVL
  const uniteOneBoardroomBalance = sdk.api.erc20
    .balanceOf({
      target: uniteOneLpAddress,
      owner: ushareRewardPoolAddress,
      block: chainBlocks["harmony"],
      chain: "harmony",
    });

  lpPositions.push({
    token: uniteOneLpAddress,
    balance: (await uniteOneBoardroomBalance).output,
  });

  // Cemetery TSHARE-FTM LP TVL
  const ushareOneLpBoardroomBalance = sdk.api.erc20
    .balanceOf({
      target: ushareOneLpAddress,
      owner: ushareRewardPoolAddress,
      block: chainBlocks["harmony"],
      chain: "harmony",
    });

  lpPositions.push({
    token: ushareOneLpAddress,
    balance: (await ushareOneLpBoardroomBalance).output,
  });

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["harmony"],
    "harmony",
    transformAddress
  );
  fixHarmonyBalances(balances) ;
  return balances;
}

module.exports = {
  methodology: 'The TVL of Unite Finance is calculated using the Viper LP token deposits(UNITE/ONE and USHARE/ONE), and the USHARE deposits found in the boardroom contract address(0x68BeEc29183464e2C80Aa9B362db8b0c0eB826bd).',
  harmony: {
    tvl,
  },
  
};