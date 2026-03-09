const { aaveV2Export } = require("../helper/aave");
const { queryV1Beta1 } = require("../helper/chain/cosmos");

let data;

async function getData() {
  if (!data) data = _getData()
  return data
  async function _getData() {
    const { registry } = await queryV1Beta1({ url: '/leverage/v1/registered_tokens', chain: 'umee'})
    return Promise.all(registry.map(async i => {
      const res = await queryV1Beta1({ url: '/leverage/v1/market_summary?denom='+i.base_denom, chain: 'umee'})
      return {
        base_denom: i.base_denom,
        borrowed: parseInt(res.borrowed),
        supplied: parseInt(res.supplied),
        exponent: parseInt(i.exponent),
      }
    }))
  }
}

async function tvl(api) {
  const data = await getData();
  data.forEach((i) =>
    api.add(i.base_denom, i.supplied - i.borrowed)
  );
}

async function borrowed(api) {
  const data = await getData();
  data.forEach((i) =>
    api.add(i.base_denom, i.borrowed)
  );
}

module.exports = {
  timetravel: false,
  methodology: "Total supplied assets - total borrowed assets",
  umee: {
    tvl,
    borrowed,
  },
  ethereum: aaveV2Export('0xe296db0a0e9a225202717e9812bf29ca4f333ba6', { fromBlock: 14216544, }),
};
