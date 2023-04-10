const sdk = require("@defillama/sdk");
const { ethers } = require("ethers");
const BigNumber = require("bignumber.js");

// Contract of T Protocol
const WTBT_TOKEN_CONTRACT = "0xD38e031f4529a07996aaB977d2B79f0e00656C56";
const TBT_TOKEN_CONTRACT = "0x07Ac55797D4F43f57cA92a49E65ca582cC287c27";
const USDC_TOKEN_CONTRACT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const TREASURY_CONTRACT = "0xa01D9bc8343016C7DDD39852e49890a8361B2884";

const multiple = (val1, val2) => {
  return new BigNumber(val1).multipliedBy(val2);
};

const pricePerTokenABI = {
  inputs: [],
  name: "pricePerToken",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  stateMutability: "view",
  type: "function",
};

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  //@dev WTBT TVL = WTBT Supply * NAV Price of WTBT
  const wtbtSupply = await api.call({
    abi: "erc20:totalSupply",
    target: WTBT_TOKEN_CONTRACT,
  });
  const pricePerToken = await api.call({
    abi: pricePerTokenABI,
    target: WTBT_TOKEN_CONTRACT,
  });
  const wtbtTVL = multiple(
    ethers.utils.formatUnits(wtbtSupply, 18),
    ethers.utils.formatUnits(pricePerToken, 6)
  ).decimalPlaces(6);
  // console.log("wtbtTVL", wtbtTVL.toString());

  //@dev TBT TVL = TBT Supply * 1 USDC
  const tbtSupply = await api.call({
    abi: "erc20:totalSupply",
    target: TBT_TOKEN_CONTRACT,
  });
  const tbtTVL = multiple(
    ethers.utils.formatUnits(tbtSupply, 18),
    ethers.utils.formatUnits("1000000", 6)
  ).decimalPlaces(6);
  // console.log("tbtTVL", tbtTVL.toString());

  //@dev TREASURY TVL = USDC Balance of Treasury
  const usdcInTreasury = await api.call({
    abi: "erc20:balanceOf",
    target: USDC_TOKEN_CONTRACT,
    params: [TREASURY_CONTRACT],
  });
  const treasuryTVL = ethers.utils.formatUnits(usdcInTreasury, 6);
  // console.log("treasuryTVL", treasuryTVL.toString());

  //@dev Total TVL = WTBT TVL + TBT TVL + TREASURY TVL
  const SummaryTVL = ethers.utils.parseUnits(
    wtbtTVL.plus(tbtTVL).plus(treasuryTVL).decimalPlaces(6).toString(),
    6
  );
  // console.log("SummaryTVL", SummaryTVL.toString());

  await sdk.util.sumSingleBalance(
    balances,
    USDC_TOKEN_CONTRACT,
    SummaryTVL,
    api.chain
  );
  // console.log("balances", balances);

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "counts the assets value of WTBT, TBT, and USDC in the Treasury",
  start: 1677913260,
  ethereum: {
    tvl,
  },
};
