const axios = require("axios");

const getTVL = async () => {
  let res = await axios.get("https://dao.oin.finance/selectTotalValue");
  if (res.status === 200) return { oin_tvl: res.data };
};

module.exports = {
  getTVL,
  methodology: "stNEAR tvl of OIN-Finance on NEAR chain",
};
