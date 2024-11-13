const { fetchLocal, mkMeta } = require("../helper/pact");

const network = (chainId) => `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
const GAS_PRICE = 0.00000001;
const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;

const getReserve = (tokenData) => {
  return parseFloat(tokenData.decimal ? tokenData.decimal : tokenData);
}

const getTokenToKadena = async (token) => {
  const chainId = '3';
  let data = await fetchLocal({
    pactCode: `
          (use free.exchange)
          (let*
            (
              (p (get-pair ${token} coin))
              (reserveA (reserve-for p ${token}))
              (reserveB (reserve-for p coin))
            )[reserveA reserveB])
           `,
    meta: mkMeta("account", chainId, GAS_PRICE, 3000, creationTime(), 600),
  }, network(chainId));

  if (data.result.status === "success") {
    const tokenReserve = getReserve(data.result.data[0]);
    const kadenaReserve = getReserve(data.result.data[1]);
    return kadenaReserve / tokenReserve;
  }

  throw new Error(`Kadena fetch failed`);
}

const fetchKdlPrice = async () => {
  return await getTokenToKadena("kdlaunch.token");
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
  const kdlPrice = await fetchKdlPrice();
  const stakedKdl = await getTotalStakedKdl();
  return {
    kadena: stakedKdl * kdlPrice
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