const { getTokenAccountBalance } = require("../helper/solana");

const collateralVaults = [
  "BRon61JiX8T1kQkREVyQsSeZvs3tyhsiHMRCjRiA6NQE",
  "FX2MNb1spudp9AuaypGFNeNFW4q8Ut1LtEe9uPzvcHh3",
  "8y72vC5upeYakEGLgMDr9z6ML8aptGVkq5T64DiVHymw",
  "9rUUoPJhdbZp4GqraxpjvNHJRayAX3ao2ZvBQqeNpQZ4",
  "HuxKhSY4ZjAFLS1PQMrTavrmXQHtRjtAPyEfRsuTMhgL",
  "EJ77XK6z1RhHdPgRAP3RuYDeTdKF5grb929awqM3Qo7k",
  "2q6ijtLDWXQRWQfgc7P21LmCR3xZQrr1ffPtzcdSQFCp",
  "4nXcKqJjCavRzmH5dGYVTSDcn1s4vLktqJCXjZZuJm5d",
  "BE8HLwqoNxauQMqSUsqYHkUEXAgzyFEbHNgFmyAcAaz6",
  "8WzxDyKZJd9vfd9YQ2p4PoWNzmvcXbWBZFSfa6ADCMFW",
  "8fUhaDGk4HRatnii8jjsefFHoVSzvS7h9nHpxchjgcZ3",
  "2EXHYHKoRXHoesAMgBWomREQxHYX94WCACiiAA2yHX1N",
  "1ppyQqhct5626Ln42ZF6UHx4DxLDuJmepJVbBehfYfi",
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
