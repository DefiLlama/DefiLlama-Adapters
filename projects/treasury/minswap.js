// https://minswap.org/analytics/dao-treasury
const { sumTokensExport} = require("../helper/chain/cardano");

const min_dao = 'addr1z9wdv59sq7zzy2l6gchq3247lz7ssfsxs45nj4njhwsp5uzj2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pqzygnta'
const min_dao_hot = 'addr1q8zntywq3fldecrqk4vl593sznvj7483ejcajnavvh2qpsvftaax5f3wasl5m49rtjw5pen938vr7863w0lfz94h0lfqldx3pu'
const min_fee_dao = 'addr1qxymvaeg3306xyp6yk3mjdj7usp40x2e5cecsh75xw5tsczj2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pqjx0th5'
const min_pol = 'addr1q9gxe8vx0kvv5g6gv4n5wmsxexjqsjftc599qqcp2vkmmwh7snv5yhw2qqvdev3c7wn6s3xhrnx25eg6zcqjxj9vrv2s0e38ze'
const min_ada_min_pol = 'addr1qx54hjkagnc7zanqkfjearg8nk2w303pgdyl2qm4hs2x8saxg62nrp8kp2mukmrr4pfyt4fpdyjp7dx8jxffs4gf2xcsx6uj7a'

module.exports = {
  cardano: {
    tvl: () => ({}),
    ownTokens: sumTokensExport({ owners: [min_dao, min_dao_hot, min_fee_dao, min_pol, min_ada_min_pol] })
  }
}
