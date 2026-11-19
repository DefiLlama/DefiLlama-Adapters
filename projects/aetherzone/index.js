const { sumTokens2 } = require("../helper/unwrapLPs");

const TOKENS = [
  "0x8cbaffd9b658997e7bf87e98febf6ea6917166f7", // WSHIDO
  "0xeE1Fc22381e6B6bb5ee3bf6B5ec58DF6F5480dF8", // USDC
  "0xdB798cF512Af4F7E41AE4Bf4b7f20CDF74Bc21f9", // CWK
  "0xa907bE8aEFF41D593dC33A29C0CBAbEbD8beC03B", // CHINA
];

const FACTORIES = [
  "0x386bfd9d4f2BC9BCBA56194E776510917570C01C", // AetherStakeFactory V7
  "0x59eE0da93DE70A6bE9C597089Cc01A2a2f499085", // StakePoolFactory V6
];

const PROTOCOL_CONTRACTS = [
  "0xDc812945b24E27BA5DBe17C71329a355Cd575239", // AetherOTC Escrow
  "0xECbd5f2dfe7033f2c62E2FfB668b600d96946E20", // AetherLPGauge
  "0x4AE8907e183DEfD989adF86529491627DE714B0e", // AetherReserveEscrow
  "0xfdF721b2b44dA4e112c8daE16B320D47E63955a8", // AetherFund Pool
];

async function tvl(api) {
  const pools = [];
  for (const target of FACTORIES) {
    pools.push(...await api.fetchList({
      lengthAbi: "uint256:poolsCount",
      itemAbi: "function allPools(uint256) view returns (address)",
      target,
    }));
  }
  const stakedTokens = await api.multiCall({ abi: "address:stakedToken", calls: pools });
  const counterTokens = await api.multiCall({ abi: "address:counterToken", calls: pools });

  const tokensAndOwners = pools.flatMap((pool, i) => [[stakedTokens[i], pool], [counterTokens[i], pool]]);
  PROTOCOL_CONTRACTS.forEach((owner) => TOKENS.forEach((token) => tokensAndOwners.push([token, owner])));
  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  methodology:
    "TVL counts the reserves creators bond into AetherZone staking pools (staked and counter tokens of every pool from the V6 and V7 factories), plus tokens held by the AetherOTC escrow, the LP gauge, the reserve escrow and the fund pool. Stakers' Uniswap V3 positions are excluded, as they are Shido Dex V3 liquidity.",
  shido: {
    tvl,
  },
};
