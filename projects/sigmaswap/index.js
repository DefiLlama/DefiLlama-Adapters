const ethers = require("ethers");

const BRIDGE_CONTRACT = "0xE58a7D7E726CD266c103cC7C2763f4a3005d78B1";
const LUKSO_RPC_URL = "https://42.rpc.thirdweb.com";

async function tvl(api) {
  const provider = new ethers.JsonRpcProvider(LUKSO_RPC_URL);
  const balance = await provider.getBalance(BRIDGE_CONTRACT);

  api.add(BRIDGE_CONTRACT, balance);
}

module.exports = {
  lukso: {
    tvl,
  },
};
