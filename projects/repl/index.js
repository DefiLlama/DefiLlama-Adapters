const { nullAddress } = require("../helper/tokenMapping");
const { get } = require("../helper/http");
const abi = require("./abi.json");

// const REPL_CONTRACT = "0xD51Cb0FA9A91f156a80188a18f039140704b8df7";
// const REPL_HELPER_CONTRACT = "0x07047192D4492d32eE117a9588576896e50975E3";
const AGENT_HELPER_CONTRACT = "0xdB49Cc86F799804F4a966dc0c7707c2AFF6a2F28";
const WFIL_WPFIL_POOL_ADDRESS = "0x443A6243A36Ef0ae1C46523d563c15abD787F4E9";
const PFIL_CONTRACT = "0xAaa93ac72bECfbBc9149f293466bbdAa4b5Ef68C";
const WPFIL_CONTRACT = "0x57E3BB9F790185Cfe70Cc2C15Ed5d6B84dCf4aDb";
const WFIL_CONTRACT = "0x60E1773636CF5E4A227d9AC24F20fEca034ee25A";

// Obtain information of miners delegated to the protocol
const getAllDelegatedMiners = (agents) => {
  // If originOwner !== 0, it means the miner is delegated
  const delegatedMiners = agents
    .filter((agent) => agent.originOwner !== 0)
    .map((agent) => {
      return {
        actorID: agent.actorID,
        agentAddress: agent.agent,
      };
    });

  return delegatedMiners;
};

// Make an API call to get actual miner info
const getActualMinerInfo = async (agentAddress, minerId) => {
  const url = `https://pfil-server.repl.fi/terminate_line?agent_address=${agentAddress}&miner_id=${minerId}`;
  const resp = await get(url);
  return resp;
};

// Total Eligible Asset Value of all miners delegated to the protocol
const getTotalEligibleAssets = async (agents) => {
  const delegatedMiners = getAllDelegatedMiners(agents);
  let minerInfos = [];
  // Iterate on miners
  for (let i = 0; i < delegatedMiners.length; i++) {
    const miner = delegatedMiners[i];
    try {
      const actualMinerInfo = await getActualMinerInfo(miner.agentAddress, miner.actorID);
      if (actualMinerInfo.error !== "")
        continue;

      minerInfos.push(actualMinerInfo);
    } catch (e) {
      console.log(`Error fetching miner info for ${miner.agentAddress}: ${e}`);
    }
  }

  return minerInfos.reduce((sum, minerInfo) => sum + +minerInfo.eligible_asset, 0);
};

// Calculate total PFIL supply value in terms of FIL
const calculateTotalPFILSupply = (totalPFILSupply, wpFILprice, PFILByWPFIL) => {
  const totalSupplyValue = totalPFILSupply * wpFILprice * PFILByWPFIL
  return totalSupplyValue;
};

// Convert sqrt96price to pool price
const SqrtToPrice = (sqrt96) => {
  const price = Number(sqrt96) ** 2 / 2 ** 192;
  return price
};

module.exports = {
  filecoin: {
    tvl: async (_, _1, _2, { api }) => {
      const [agents, slot0, totalPFILSupply, PFILperToken, poolWFILBal,] = await Promise.all([
        api.call({ abi: abi.getAllAgents, target: AGENT_HELPER_CONTRACT }),
        api.call({ abi: abi.slot0, target: WFIL_WPFIL_POOL_ADDRESS }),
        api.call({ abi: abi.totalSupply, target: PFIL_CONTRACT }),
        api.call({ abi: abi.PFILPerToken, target: WPFIL_CONTRACT }),
        api.call({ abi: "erc20:balanceOf", target: WFIL_CONTRACT, params: WFIL_WPFIL_POOL_ADDRESS, }),
      ]);

      const wpFILprice = SqrtToPrice(slot0.sqrtPriceX96);

      const totalEligibleAssetsValue = await getTotalEligibleAssets(agents);
      // const totalSupplyValue = calculateTotalPFILSupply(totalPFILSupply, wpFILprice, PFILperToken / 1e18);

      api.add(nullAddress, totalEligibleAssetsValue);
      api.add(nullAddress, poolWFILBal);
      // api.add(nullAddress, totalSupplyValue);
    },
  },
};
