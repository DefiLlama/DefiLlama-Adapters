const { getStakedSol } = require("../helper/solana")

async function tvl(api) {
  await getStakedSol('75NPzpxoh8sXGuSENFMREidq6FMzEx4g2AfcBEB6qjCV', api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
};