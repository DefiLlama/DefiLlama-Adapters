const sdk = require("@defillama/sdk")

const ADAOTreasuryAddress = "0x9E5A8BB92C3E5A8bf5bad9c40a807dE4151311d1";
const ADAOStakingContract = "0x3BFcAE71e7d5ebC1e18313CeCEbCaD8239aA386c";

async function treasury(timestamp, block, chainBlocks) {
  const balances = {};
  const { output } = await sdk.api.eth.getBalance({ target: ADAOTreasuryAddress, chain: 'astar', block: chainBlocks.astar })
  balances[`astar`] = output/1e18;
  return balances;
}

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const { output } = await sdk.api.abi.call({ target: ADAOStakingContract, chain: 'astar', block: chainBlocks.astar, abi: "uint256:totalSupply" })
  balances[`astar`] = output/1e18;
  return balances;
}
module.exports = {
  methodology:
    "A-DAO will be based on dApp staking of Astar Network. Users will get some of the developer rewards while participating and gaining basic rewards. At present, A-DAO divides the developer rewards into: Revenue Reward, On-chain Treasury, Incubation Fund, any rewards of which can be adjusted by DAO governance.",
  astar: {
    tvl,
    treasury,
  },
};
