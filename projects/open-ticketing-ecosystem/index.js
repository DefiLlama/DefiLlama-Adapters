const { staking } = require("../helper/staking");

const stakingContractEthereum = "0x686e8500B6bE8812EB198aAbbbFA14C95c03fC88";
const openTokenEthereum = "0xc28eb2250d1ae32c7e74cfb6d6b86afc9beb6509";
const stakingContractPolygon = "0x686e8500B6bE8812EB198aAbbbFA14C95c03fC88";
const openTokenAddressPolygon = "0x7844F79FC841E4F92d974C417031c76F8578c2D5";

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(stakingContractEthereum, openTokenEthereum),
  },
  polygon: {
    tvl: () => ({}),
    staking: staking(stakingContractPolygon, openTokenAddressPolygon),
  },
};
