const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const abi = require("./abi.json");

const KlayPortalAddress = "0x67A7F7c9195214FdDE587E98f736466d26FaC5A0";
const ETHER = new BigNumber(10).pow(18);
const APIID = "klay-token";

async function tvl(timestamp, ethBlock, chainBlocks) {

  const balances = {};
  const chain = "klaytn";
  const block = chainBlocks[chain];

  const data = await sdk.api.abi.call({
    target: KlayPortalAddress,
    block,
    chain,
    abi: abi.stakingPoolSum,
    params: [],
  });

  sdk.util.sumSingleBalance(balances, APIID, new BigNumber(data.output).dividedBy(ETHER).toNumber());

  return balances
}

module.exports = {
    methodology: "TVL is equal to the amount of KLAY staked in the Staking pool",
  klaytn: {
    tvl: tvl,
  },
};
