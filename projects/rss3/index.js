const sdk = require("@defillama/sdk");
const STAKING_CONTRACT = "0x28F14d917fddbA0c1f2923C406952478DfDA5578";
const Bridge_ETH ="0x4cbab69108Aa72151EDa5A3c164eA86845f18438"
const RSS3_TOKEN_ETH = "0xc98D64DA73a6616c42117b582e832812e7B8D57F";
const RSS3_TOKEN_VSL = "0x4200000000000000000000000000000000000042";
const { staking } = require("../helper/staking");
const CHAIN = "rss3_vsl";

async function eth_tvl(_, _1, _2, { api }) {
  const bridged = await api.call({
    abi: 'erc20:balanceOf',
    target: RSS3_TOKEN_ETH,
    params: Bridge_ETH,
  });
  api.add(RSS3_TOKEN_ETH, bridged)
}

async function vsl_tvl(_, _1, _2, { api }) {
  let balances = {};

  const supply = await api.call({
    abi: "erc20:totalSupply",
    target: RSS3_TOKEN_VSL,
  });

  sdk.util.sumSingleBalance(
    balances,
    'RSS3',
    supply / 10 ** 18
  )

  return balances;
}


module.exports = {
  misrepresentedTokens: false,
  methodology : "TVL includes the total supply of the RSS3 token on the VSL, which is equivalent to the amount of tokens bridged from the Ethereum mainnet.",
  hallmarks: [[1710047755, "Mainnet Alpha Staking Launch"]],
  // ethereum: {
  //   tvl: eth_tvl,
  // },
  rss3_vsl: {
    tvl: vsl_tvl,
    staking: staking(STAKING_CONTRACT, RSS3_TOKEN_VSL, CHAIN, RSS3_TOKEN_ETH),
  },
};