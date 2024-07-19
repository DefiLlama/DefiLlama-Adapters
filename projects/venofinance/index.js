const { staking } = require("../helper/staking.js");

const fountain_contract_address = "0xb4be51216f4926ab09ddf4e64bc20f499fd6ca95";
const reservoir_contract_address = "0x21179329c1dcfd36ffe0862cca2c7e85538cca07";
const vno_contract_address = "0xdb7d0a1ec37de1de924f8e8adac6ed338d4404e9";

async function tvlCronos(api) {
  const lcro_contract_address = "0x9Fae23A2700FEeCd5b93e43fDBc03c76AA7C08A6";
  const latom_contract_address = "0xac974ee7fc5d083112c809ccb3fce4a4f385750d";

  const cro_pooled = await api.call({ abi: "uint256:getTotalPooledCro", target: lcro_contract_address, })
  const atom_pooled = await api.call({ abi: "uint256:getTotalPooledToken", target: latom_contract_address, })

  api.addGasToken(cro_pooled)
  api.addCGToken('cosmos', atom_pooled / 1e6)
  return api.getBalances()
}

async function tvlEra(api) {
  const leth_contract_address = "0xE7895ed01a1a6AAcF1c2E955aF14E7cf612E7F9d";

  const eth_pooled = await api.call({ abi: "uint256:getTotalPooledToken", target: leth_contract_address, })
  api.addGasToken(eth_pooled)
  return api.getBalances()
}

module.exports = {
  methodology: "TVL counts tokens staked by the protocol.",
  cronos: {
    tvl: tvlCronos,
    staking: staking(
      [fountain_contract_address, reservoir_contract_address],
      vno_contract_address
    ),
  },
  era: {
    tvl: tvlEra,
  },
};
