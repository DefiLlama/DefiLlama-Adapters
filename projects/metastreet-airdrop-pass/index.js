const abi = require("./abi.json");
var ethers = require("ethers");
var getLogs = require("../helper/cache/getLogs");

const CHAINS = {
  ethereum: {
    airdropPassFactory: "0xA8a7e295c19b7D9239A992B8D9C053917b8841C6",
    fromBlock: 20518021, // Block number of pool factory creation
  }
};
const MAX_UINT_128 = "0xffffffffffffffffffffffffffffffff";
const AIRDROP_PASS_DEPLOYED_TOPIC = "0x15fc3a903a61f172517fb952e6bd117215850f3dbfb9de008591509754dabf59";

async function tvl(api) {
  const chainInfo = CHAINS[api.chain]
  const contract = new ethers.Contract(chainInfo.airdropPassFactory, [abi["AirdropPassTokenDeployed"]]);

  /* Get airdrop pass deployed logs and parse it */
  const rawLogs = await getLogs.getLogs({
    target: chainInfo.airdropPassFactory,
    fromBlock: chainInfo.fromBlock,
    api,
    topics: [AIRDROP_PASS_DEPLOYED_TOPIC],
  });
  const parsedLogs = rawLogs.map((log) => ({
    ...contract.interface.parseLog(log),
  })).filter(o => o.args[3] > api.timestamp);

  /* Compute delegate tokens balances held by factory */
  const delegateTokenIds = await api.multiCall({ abi: abi.delegateTokenIds, calls: parsedLogs.map((log) => ({
    target: chainInfo.airdropPassFactory,
    params: [log.args[0], 0, MAX_UINT_128]}))});
  const balances = {}
  parsedLogs.map((log, index) => {
    const k = `${api.chain}:${log.args[2]}`
    balances[k] = delegateTokenIds[index].length
  })
  
  return balances;
}

module.exports = {
  ethereum: {
    tvl
  },
  methodology:
    "TVL is calculated by summing the value of underlying NFTs of the delegation tokens owned by MetaStreet Airdrop Pass Factory."
};
