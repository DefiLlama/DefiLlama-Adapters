const { sumTokens2 } = require("../helper/unwrapLPs");

// Contract of T Protocol
const WTBT_TOKEN_CONTRACT = "0xD38e031f4529a07996aaB977d2B79f0e00656C56";
const TBT_TOKEN_CONTRACT = "0x07Ac55797D4F43f57cA92a49E65ca582cC287c27";
const USDC_TOKEN_CONTRACT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const TREASURY_CONTRACT = "0xa01D9bc8343016C7DDD39852e49890a8361B2884";

const pricePerTokenABI = 'uint256:pricePerToken'

async function tvl(_, _1, _2, { api }) {
  //@dev WTBT TVL = WTBT Supply * NAV Price of WTBT
  const wtbtSupply = (await api.call({    abi: "erc20:totalSupply",    target: WTBT_TOKEN_CONTRACT,  })) / 1e18
  const pricePerToken = await api.call({    abi: pricePerTokenABI,    target: WTBT_TOKEN_CONTRACT,  })
  api.add(USDC_TOKEN_CONTRACT, wtbtSupply * pricePerToken)

  //@dev TBT TVL = TBT Supply * 1 USDC
  const tbtSupply = await api.call({    abi: "erc20:totalSupply",    target: TBT_TOKEN_CONTRACT,  }) / 1e18
  api.add(USDC_TOKEN_CONTRACT, tbtSupply * 1e6)

  //@dev TREASURY TVL = USDC Balance of Treasury
  return sumTokens2({ api, owner: TREASURY_CONTRACT, tokens: [USDC_TOKEN_CONTRACT]});
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "counts the assets value of WTBT, TBT, and USDC in the Treasury",
  start: 1677913260,
  ethereum: {
    tvl,
  },
};
