const { fetchLocal, mkMeta } = require("../helper/pact");

const chainId = "5";
const network = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
const GAS_PRICE = 0.00000001;
const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;


const getReserve = (tokenData) => {
  return parseFloat(tokenData.decimal ? tokenData.decimal : tokenData);
};


const getCabinetTvl = async () => {
    const data = await fetchLocal(
        {
            pactCode: `(coin.get-balance "c:86aaCQXT8uRkyXGXu9k-eNn1kXqV_nNmjTYErKpZ6vE")`,
            meta: mkMeta("", chainId, GAS_PRICE, 3000, creationTime(), 600)
        },
        network
    );
      if (data.result.status === "success") {
          return getReserve(data.result.data);
      }
      throw new Error("Failed do fetch TVL");

}

async function tvl() {
    const cabinetTvl = await getCabinetTvl();
  return {
      kadena: cabinetTvl,
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  kadena: {
    tvl: tvl,
  },
};
