const config = require("./config");

async function tvl(api) {
  const { listarush} = config[api.chain];

  const token_lista = await api.call({ abi: 'address:Lista', target: listarush, });
  const bal = await api.call({ abi: 'uint256:totalDeposited', target: listarush, });
  api.add(token_lista, bal)
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl,
  };
});

module.exports.doublecounted = true