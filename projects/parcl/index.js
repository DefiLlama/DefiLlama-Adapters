const { getTokenAccountBalance } = require("../helper/solana");

const collateralVaults = [
  "BRon61JiX8T1kQkREVyQsSeZvs3tyhsiHMRCjRiA6NQE",
  "FX2MNb1spudp9AuaypGFNeNFW4q8Ut1LtEe9uPzvcHh3",
  "8y72vC5upeYakEGLgMDr9z6ML8aptGVkq5T64DiVHymw",
  "9rUUoPJhdbZp4GqraxpjvNHJRayAX3ao2ZvBQqeNpQZ4",
  "HuxKhSY4ZjAFLS1PQMrTavrmXQHtRjtAPyEfRsuTMhgL",
  "EJ77XK6z1RhHdPgRAP3RuYDeTdKF5grb929awqM3Qo7k",
  "5hHfPfyvgqLUy7YKNifmkRLGR3TsEtkPePcD4fK3Cf3U",
  "7Si7o3jSvTkd5XKfLAG1j5jJsVyf9xGF41VAfZ5J2WMH",
  "6vPhHq5dmxQ1TReVbP6KZLuZSWBTCZYD5xewgodiQtpr",
  "FAkAaRUwGBXWcVXgKPm7tLrtKRumDKL85o2sc6GiJB2q",
  "CAYRqwXJnfY6rvdEr5764Mzpx3PwNvh8kjidKYPkFwmq",
  "3mE1oiFdLs8zntSk8bPLLY6Cq1vf5tbHpnyywunFysGZ",
  "AWoQgYmaNDUERUePyo6f5LkxA9ozmjKg8MmKtfJn33Hb",
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
