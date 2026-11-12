const HUBBLE = "0xd441a37aA73fc1DDd2db99FC4c92f233b7d41CBd";
const EX = "0xd4d197F3397C8F28f4BC2C698104CfbCC3e04802";
const STS = "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955";
const USDC = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894";

const MISSION_CONTROL = "0xd268e36Ea3c1948284D40855cc2C26A71Ad07095";
const REDEEMER = "0x3C3cC567b7c8f98e7BD244E575FdE61016ef66B5";

const HUBBLE_USDC_LP = "0x9ff1b68f8bedF4665fE358F92C3E9aF386cb295f";
const EX_STS_LP = "0x37be2fF30Efde8c05E8E4A59486Db82AEBC5d892";

const poolInfoAbi =
  "function poolInfo(uint256) view returns (address token, uint256 totalStake, uint256 lastRewardTime, bool isStarted)";

async function getPoolData(api, pair, protocolToken, quoteToken) {
  const [totalSupply, stakedLp, token0, token1, reserves] =
    await Promise.all([
      api.call({
        target: pair,
        abi: "erc20:totalSupply",
      }),
      api.call({
        target: pair,
        abi: "erc20:balanceOf",
        params: [MISSION_CONTROL],
      }),
      api.call({
        target: pair,
        abi: "address:token0",
      }),
      api.call({
        target: pair,
        abi: "address:token1",
      }),
      api.call({
        target: pair,
        abi: "function getReserves() view returns (uint256 reserve0, uint256 reserve1, uint256 blockTimestampLast)",
      }),
    ]);

  const normalizedToken0 = token0.toLowerCase();
  const normalizedToken1 = token1.toLowerCase();
  const normalizedProtocolToken = protocolToken.toLowerCase();
  const normalizedQuoteToken = quoteToken.toLowerCase();

  const containsExpectedTokens =
    (normalizedToken0 === normalizedProtocolToken &&
      normalizedToken1 === normalizedQuoteToken) ||
    (normalizedToken0 === normalizedQuoteToken &&
      normalizedToken1 === normalizedProtocolToken);

  if (!containsExpectedTokens) {
    throw new Error(`Unexpected tokens in LP ${pair}`);
  }

  const reserve0 = BigInt(reserves.reserve0 ?? reserves[0]);
  const reserve1 = BigInt(reserves.reserve1 ?? reserves[1]);

  return {
    totalSupply: BigInt(totalSupply),
    stakedLp: BigInt(stakedLp),
    protocolReserve:
      normalizedToken0 === normalizedProtocolToken ? reserve0 : reserve1,
    quoteReserve:
      normalizedToken0 === normalizedQuoteToken ? reserve0 : reserve1,
  };
}async function tvl(api) {
  const redemptionPool = await api.call({
    target: REDEEMER,
    abi: "address:redemptionPool",
  });

  return api.sumTokens({
    owner: redemptionPool,
    tokens: [STS],
  });
}

async function staking(api) {
  const [xhubblePool, xexPool] = await api.multiCall({
    target: MISSION_CONTROL,
    abi: poolInfoAbi,
    calls: [0, 1],
  });

  const [hubblePoolData, exPoolData] = await Promise.all([
    getPoolData(api, HUBBLE_USDC_LP, HUBBLE, USDC),
    getPoolData(api, EX_STS_LP, EX, STS),
  ]);

  const stakedXHubble = BigInt(xhubblePool.totalStake ?? xhubblePool[1]);
  const stakedXex = BigInt(xexPool.totalStake ?? xexPool[1]);

  // Value xHUBBLE using HUBBLE's price in the HUBBLE/USDC pool.
  const hubbleValueInUsdc =
    (stakedXHubble * hubblePoolData.quoteReserve) /
    hubblePoolData.protocolReserve;

  // Value xEX using EX's price in the EX/stS pool.
  const exValueInSts =
    (stakedXex * exPoolData.quoteReserve) /
    exPoolData.protocolReserve;

  api.add(USDC, hubbleValueInUsdc);
  api.add(STS, exValueInSts);
}

async function pool2(api) {
  const [hubblePoolData, exPoolData] = await Promise.all([
    getPoolData(api, HUBBLE_USDC_LP, HUBBLE, USDC),
    getPoolData(api, EX_STS_LP, EX, STS),
  ]);

  // A balanced LP position is worth twice its quote-token side.
  const lockedUsdc =
    (hubblePoolData.quoteReserve * hubblePoolData.stakedLp) /
    hubblePoolData.totalSupply;

  const lockedSts =
    (exPoolData.quoteReserve * exPoolData.stakedLp) /
    exPoolData.totalSupply;

  api.add(USDC, lockedUsdc * 2n);
  api.add(STS, lockedSts * 2n);
}

module.exports = {
  doublecounted: false,
  misrepresentedTokens: true,
  methodology:
    "Base TVL consists of stS held in Hubble's active redemption pool. Staked xHUBBLE is priced from the HUBBLE/USDC pool and staked xEX is priced from the EX/stS pool. Pool2 consists of HUBBLE/USDC and EX/stS LP tokens deposited in Mission Control, valued from each pool's quote-token reserves.",
  sonic: {
    tvl,
    staking,
    pool2,
  },
};