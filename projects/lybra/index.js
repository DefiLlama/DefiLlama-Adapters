const sdk = require("@defillama/sdk");

// Lybra holds total stake collateral (deposited ETH)
const LYBRA_CONTRACT = "0x97de57eC338AB5d51557DA3434828C5DbFaDA371";

async function tvl(_, block) {

  const lybraEthTvl = (
    await sdk.api.abi.call({
      target: LYBRA_CONTRACT,
      abi: "uint256:totalDepositedEther",
      block,
    })
  ).output;

  return {
    [ETH_ADDRESS]: lybraEthTvl,
  };
}

module.exports = {
  timetravel: true,
  start: 1682265600,
  ethereum: {
    tvl,
  }
  
};
