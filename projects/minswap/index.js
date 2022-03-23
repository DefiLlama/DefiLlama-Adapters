const axios = require("axios");

async function getLockedLovelace(address) {
  return (
    await axios.get(
      `https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`,
      {
        headers: {
          project_id: "mainnetTV9qV3mfZXbE6e44TVGMe1UoRlLrpSQt",
        },
      }
    )
  ).data.amount.find((token) => token.unit === "lovelace").quantity;
}

async function tvl() {
  // old contracts
  const oldLiquidityPoolLocked = await getLockedLovelace(
    "addr1z9tu3ecccgqlhgg2nkshfrt8td2zs8fmrwvrchgksl78x96j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq26n58l"
  );
  const oldBatchOrderLocked = await getLockedLovelace(
    "addr1wyx22z2s4kasd3w976pnjf9xdty88epjqfvgkmfnscpd0rg3z8y6v"
  );
  const oldTVL = oldLiquidityPoolLocked * 2 + oldBatchOrderLocked;

  // migrator proxy
  const migratorLocked = await getLockedLovelace(
    "addr1v8y7zqqd25d99358ga3vjgxdd6mkfgj7uuzja8u5j76nxtq335lpz"
  );

  // new contracts
  const newLiquidityPoolLocked = await getLockedLovelace(
    "addr1zxhygvl54d7gdkvca5c7fenzqplct8458kh3yyp0f3nhyyzj2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pqalueg9"
  );
  const newBatchOrderLocked = await getLockedLovelace(
    "addr1w864yj94neen54cyqaa5zrutfdgwg2xeq35ydssgsc04k7suzd8cr"
  );
  const newTVL = newLiquidityPoolLocked * 2 + newBatchOrderLocked;

  return {
    cardano: (oldTVL + migratorLocked * 2 + newTVL) / 1e6,
  };
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
};
