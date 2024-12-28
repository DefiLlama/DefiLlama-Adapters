const { get } = require("../helper/http");
async function tvl() {
  const compxTvlData = await get(
    "https://compx-backend-e899c.ondigitalocean.app/get-compx-tvl"
  );
  //Calculating user tvl:
  //usersFarmPosition = userLpBalance / farmTotalTvlLp
  //userDollarTvl = farmTvl * usersFarmPosition
  const tvlUsd = compxTvlData.data.tvlDetails.reduce((total, userTvl) =>{
    const usersDollarTvl = Number((Number(userTvl.farmTvl) * Number(userTvl.usersFarmPosition)).toFixed(3));
    return total + usersDollarTvl;
  }, 0)
  return { tether: tvlUsd };
}

module.exports = {
  algorand: {
    tvl,
  },
};