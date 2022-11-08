const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");

const { staking } = require("../helper/staking");

const VOTING_ESCROW = "0xa770697cecA9Af6584aA59DD9F226eaF6Cd0c2dc";
const NUMIS = "0x34769D3e122C93547836AdDD3eb298035D68F1C3";
const LP_REWARDS = "0xEFE7904b244d0a72dD56EE459FB0f96209aff438";
const NUMIS_LP = "0xF06550C34946D251C2EACE59fF4336168dB7EbF2";

const funds = [
  "0x9353d11eF99b8703D58FeAf69591DA62d6d6324e", // MIM3CRV
  "0xf31c6eE97070dcc73781c7C9d45EC9b5E86D2912", // ALETHCRV
  "0x1014A2e3de1C4d6C5998D7e5a264F22a35d2cACc", // CRVCVXETH
  "0x1d9DC26A9067DA6C8e6038eBF176b7eB3E394149", // CRV3CRYPTO
  "0x428F5B8b8fE7b9247c09aDE2cbd7573A3BfF649D", // FRAX3CRV
];

async function tvl(timestamp, block) {
  const balances = {};
  const calls = funds.map(i => ({ target: i }))
  const [
    tokens, vaultTokens, pricePerFullShares
  ] = await Promise.all([abi.token, abi.vaultToken, abi.getPricePerFullShare].map(abi => sdk.api.abi.multiCall({ calls, abi, block })))

  const tokenCalls = vaultTokens.output.map(i => ({ target: i.output }))
  const { output: supplies } = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: tokenCalls, block,
  })
  tokens.output.forEach(({ output: token }, i) => {
    const pricePerFullShare = pricePerFullShares.output[i].output
    const supply = supplies[i].output
    sdk.util.sumSingleBalance(balances, token, BigNumber(supply * pricePerFullShare / 1e18).toFixed(0))
  })
  return balances
}

module.exports = {
  methodology: "Counts the underlying assets in each fund",
  ethereum: {
    tvl,
    staking: staking(VOTING_ESCROW, NUMIS),
    pool2: staking(LP_REWARDS, NUMIS_LP),
  },
};
