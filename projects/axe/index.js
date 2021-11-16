const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const erc20 = require("../helper/abis/erc20.json");
const { sumTokensAndLPsSharedOwners, sumTokens, unwrapUniswapLPs } = require("../helper/unwrapLPs");

const treasuryAddresses = ["0xa2039621Cc042567092fAaee89B03Ef959F89712"];
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const AXE_DAI_SLP = "0xd34d3b648db688bee383022dd26a9027592b82d5";
const AXEStaking = "0x7f4d186b76a39a2da32804a8c35b3d04e0e174fd";
const AXE = "0x30AC8317DfB0ab4263CD8dB1C4F10749911B126C";

/*** Staking of native token (AXE) TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
    const stakingBalance = await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: AXE,
        params: AXEStaking,
        block: ethBlock,
    });
  
    return {
        [AXEStaking]: stakingBalance.output
    };
};

/*** Bonds TVL Portion (Treasury) ***
 * Treasury TVL consists of DAI and UNI-V2 balances
 ***/
 async function ethTvl(timestamp, block) {
    const balances = {};
  
    await sumTokensAndLPsSharedOwners(
      balances,
      [
        [DAI, false],
        [AXE_DAI_SLP, true],
        [USDC, false]
      ],
      treasuryAddresses,
      block
    );
  
    return balances;
}

module.exports = {
    start: 1637036516, // 16 Nov 2021
    ethereum: {
      tvl: ethTvl,
      staking
    },
    methodology:
      "Counts DAI, DAI SLP (AXE-DAI) on the treasury",
};