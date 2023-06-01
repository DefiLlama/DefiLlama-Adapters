const sdk = require("@defillama/sdk");
const { api } = require("@defillama/sdk");
const { ethers } = require("ethers");
// const abi = require("./abi.json");

const VAULT_CONTRACT = "0xD522395dfD017F47a932D788eC7CB058aDBbc783";

async function arbTvl(_, _1, _2, { api }) {
  const balances = {};
  const abi = ["function checkBalance() external view returns (uint256)"];
 const contract = new ethers.Contract(VAULT_CONTRACT, abi, ethers.provider);
  // const stablecoins = (
  //   await sdk.api.abi.call({
  //     abi: abi.getAllAssets,
  //     target: VAULT_CONTRACT,
  //     block: ethBlock,
  //   })
  // ).output;

  // const balance_stablecoin = (
  //   await api.call({
  //     abi: abi,
  //     target: VAULT_CONTRACT,
  //     block: _2,
  //   })
  // );

  const balance_stablecoin = await contract.checkBalance();
  // console.log(balance_stablecoin);

  sdk.util.sumSingleBalance(balances, VAULT_CONTRACT, balance_stablecoin, api.chain);

  return balances;
}

module.exports = {

  arbitrum: {
    tvl: arbTvl,
  },
};
