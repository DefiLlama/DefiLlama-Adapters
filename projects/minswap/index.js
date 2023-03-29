const { getAdaInAddress } = require("../helper/chain/cardano");

async function tvl() {
  const liquidityPoolLocked = await getAdaInAddress("addr1z8snz7c4974vzdpxu65ruphl3zjdvtxw8strf2c2tmqnxz2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq0xmsha")
  const batchOrderLocked =
    (await getAdaInAddress(
      "addr1wxn9efv2f6w82hagxqtn62ju4m293tqvw0uhmdl64ch8uwc0h43gt"
    )) +
    (await getAdaInAddress(
      "addr1zxn9efv2f6w82hagxqtn62ju4m293tqvw0uhmdl64ch8uw6j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq6s3z70"
    ));
  return {
    cardano: (liquidityPoolLocked * 2) + batchOrderLocked,
  };
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
  hallmarks:[
    [1647949370, "Vulnerability Found"],
  ],
};
