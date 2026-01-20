const { fetchLocal, mkMeta } = require("../helper/pact");

const network = (chainId) => `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;

const getReserve = (tokenData) => {
  return parseFloat(tokenData.decimal ? tokenData.decimal : tokenData);
}


const getTotalStakedKdl = async () => {
  const chainId = '1';
  let data = await fetchLocal(
    {
      pactCode: '(kdlaunch.staking.get-staking-stats)',
      meta: mkMeta('', chainId, 0.01, 1000, 28800, creationTime())
    },
    network(chainId)
  );
  
  if (data.result.status === "success") {
    return getReserve(data.result.data.totalStaked);
  }

  throw new Error("Total KDL stacked failed");
}

async function fetchStakingTvl() {
  const stakedKdl = await getTotalStakedKdl();
  return {
    kdlaunch: stakedKdl
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  kadena: {
    tvl: ()=>({}),
    staking: fetchStakingTvl,
  }
}