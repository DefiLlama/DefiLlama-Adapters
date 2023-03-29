const { getTokenAccountBalance } = require("../helper/solana");

const collateralVaults = [
  "BRon61JiX8T1kQkREVyQsSeZvs3tyhsiHMRCjRiA6NQE",
  "FX2MNb1spudp9AuaypGFNeNFW4q8Ut1LtEe9uPzvcHh3",
  "8y72vC5upeYakEGLgMDr9z6ML8aptGVkq5T64DiVHymw",
  "9rUUoPJhdbZp4GqraxpjvNHJRayAX3ao2ZvBQqeNpQZ4",
  "HuxKhSY4ZjAFLS1PQMrTavrmXQHtRjtAPyEfRsuTMhgL",
  "EJ77XK6z1RhHdPgRAP3RuYDeTdKF5grb929awqM3Qo7k",
];

async function tvl() {
  const balances = await Promise.all(
    collateralVaults.map((vault) => getTokenAccountBalance(vault))
  );
  return { "usd-coin": balances.reduce((sum, balance) => sum + balance, 0) };
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};
