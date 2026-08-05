const sui = require("../helper/chain/sui");

const POOL_TYPE =
    "0x70285592c97965e811e0c6f98dccc3a9c2b4ad854b3594faab9597ada267b860::pool::Pool";

const blacklistPools = [
  '0x584e68589d2ce655c47fa88d75090258c0d8b5b16c3d643e0ddc2b71e81e6546',
  '0xb64d0313a3a542e3d8f8066df767e2459d356377ca15ff003ef5e16629569b4d',
  '0x1d182ec3743611393c06e810662dcf70efcfd2e16d855dfdb4dee6abc1bf9ce0',
]

async function momentumTVL(api) {
    const pools = (await sui.getObjectsByType(POOL_TYPE)).filter(p => !blacklistPools.includes(p.fields.id.id));
    pools.forEach((i) => {
        const [token0, token1] = i.type.split("<")[1].replace(">", "").split(", ");
        api.add(token0, i.fields.reserve_x);
        api.add(token1, i.fields.reserve_y);
    });
}

module.exports = {
    timetravel: false,
    methodology: "Collects TVL for all CLMM pools created on Momentum",
    sui: {
        tvl: momentumTVL,
    },
};
