const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const erc20 = require("../helper/abis/erc20.json");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking.js");

const treasuryAddresses = ["0xa2039621Cc042567092fAaee89B03Ef959F89712"];
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const AXEStaking = "0x7f4d186b76a39a2da32804a8c35b3d04e0e174fd";
const AXE = "0x30AC8317DfB0ab4263CD8dB1C4F10749911B126C";

const AXE_DAI_POOL = {
  lpToken: "0xd34d3b648db688bee383022dd26a9027592b82d5",
  token0: "0x30ac8317dfb0ab4263cd8db1c4f10749911b126c",
  token1: "0x6b175474e89094c44da98b954eedeac495271d0f",
}

async function calcTvl(balances, pools, block, chain) {
  for (let i = 0; i < pools.length; i++) {
    let { output: balance } = await sdk.api.abi.multiCall({
      calls: [
        {
          target: pools[i].token0,
          params: pools[i].lpToken,
        },
        {
          target: pools[i].token1,
          params: pools[i].lpToken,
        },
      ],
      abi: "erc20:balanceOf",
      block: block,
      chain: chain,
    });
    let tokens = [pools[i].token0, pools[i].token1];

    sdk.util.sumSingleBalance(balances, tokens[0], balance[0].output);
    sdk.util.sumSingleBalance(balances, tokens[1], balance[1].output);
  }
}

/*** Bonds TVL Portion (Treasury) ***
 * Treasury TVL consists of DAI and UNI-V2 balances
 ***/
 async function ethTvl(timestamp, block) {
    const balances = {};
  
    await sumTokensAndLPsSharedOwners(
      balances,
      [
        [DAI, false],
        [USDC, false]
      ],
      treasuryAddresses,
      block
    );
  
    return balances;
}

async function ethPool2(timestamp, block) {
  let balances = {};
  await calcTvl(balances, [AXE_DAI_POOL], block, "ethereum");
  return balances;
}

module.exports = {
    start: 1637036516, // 16 Nov 2021
    ethereum: {
      tvl: ethTvl,
      staking: staking(AXEStaking, AXE, "ethereum"),
      pool2: ethPool2,
    },
    methodology:
      "Counts DAI, DAI SLP (AXE-DAI) on the treasury",
};