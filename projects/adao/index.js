const Web3 = require("web3");
const abi = require("./abi.json");

const web3 = new Web3(
  new Web3.providers.HttpProvider(`https://astar.api.onfinality.io/public`)
);

const ADAOTreasuryAddress = "0x9E5A8BB92C3E5A8bf5bad9c40a807dE4151311d1";
const ADAOStakingContract = "0x3BFcAE71e7d5ebC1e18313CeCEbCaD8239aA386c";

async function treasury(timestamp, block, chainBlocks) {
  const balances = {};
  let balance = await web3.eth.getBalance(ADAOTreasuryAddress);
  balance = web3.utils.fromWei(balance, "ether");
  balances[`astar`] = Number(balance);
  return balances;
}

async function staking(timestamp, block, chainBlocks) {
  const balances = {};
  var dappContract = new web3.eth.Contract(abi, ADAOStakingContract);
  let balance = await dappContract.methods.totalSupply().call();
  balance = web3.utils.fromWei(balance, "ether");
  balances[`astar`] = Number(balance);
  return balances;
}
module.exports = {
  methodology:
    "A-DAO will be based on dApp staking of Astar Network. Users will get some of the developer rewards while participating and gaining basic rewards. At present, A-DAO divides the developer rewards into: Revenue Reward, On-chain Treasury, Incubation Fund, any rewards of which can be adjusted by DAO governance.",
  astar: {
    tvl: staking,
    treasury,
    staking,
  },
};
