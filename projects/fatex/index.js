const sdk = require("@defillama/sdk");
const { transformPolygonAddress } = require("../helper/portedTokens");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const BigNumber = require("bignumber.js");

const FACTORY_CONTRACT = "0x937e0c67d21Df99eaEa0e6a1055A5b783291DC8f";
const FATE_TOKEN = "0x4853365bC81f8270D902076892e13F27c27e7266";
const USDC_TOKEN = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const FATE_USDC_PAIR_TOKEN = "0x69c894Dce6FA2E3b89D3111d29167F0484AC0b2A";
const X_FATE_TOKEN = "0x56BE76031A4614370fA1f188e01e18a1CF16E642";

async function xFateTvl(timestamp, block, chainBlocks) {
  const balances = {};

  const fateBalanceRaw = (await sdk.api.abi.call({
    abi: "erc20:balanceOf",
    chain: "polygon",
    target: FATE_TOKEN,
    params: [X_FATE_TOKEN],
    block: chainBlocks["polygon"]
  })).output;

  const fateReservesRaw = (await sdk.api.abi.call({
    abi: "erc20:balanceOf",
    chain: "polygon",
    target: FATE_TOKEN,
    params: [FATE_USDC_PAIR_TOKEN],
    block: chainBlocks["polygon"]
  })).output;

  const usdcReservesRaw = (await sdk.api.abi.call({
    abi: "erc20:balanceOf",
    chain: "polygon",
    target: USDC_TOKEN,
    params: [FATE_USDC_PAIR_TOKEN],
    block: chainBlocks["polygon"]
  })).output;

  balances['usd-coin'] = new BigNumber(fateBalanceRaw).times(usdcReservesRaw).div(fateReservesRaw).div(1e6).toNumber();

  return balances;
}

const pool2 = calculateUsdUniTvl(FACTORY_CONTRACT, "polygon", USDC_TOKEN, [FATE_TOKEN], "usd-coin", 6);

module.exports = {
  misrepresentedTokens: false,
  methodology: "Gets the value of all tokens in FATExFi liquidity pools and staking contracts",
  timetravel: true,
  polygon: {
    tvl: async (timestamp, block, chainBlocks) => {
      const balances = await pool2(timestamp, block, chainBlocks);
      balances['usd-coin'] = balances['usd-coin'] + (await xFateTvl(timestamp, block, chainBlocks))['usd-coin'];
      return balances;
    },
    pool2: pool2,
    staking: xFateTvl
  }
};
