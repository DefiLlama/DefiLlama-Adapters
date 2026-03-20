const { getSolBalanceFromStakePool } = require('../helper/solana');

const token = '0x7a7c9db510ab29a2fc362a4c34260becb5ce3446';

async function solanaTVL(api) {
  return getSolBalanceFromStakePool(
    '8B9yuGU5SbXLE56k4yH2AfqbMXNEah7MJMbZKDPqg23X',
    api
  );
}

async function cronosTVL(api) {
  return {
    ["cronos:" + token]: await api.call({
      target: token,
      abi: "erc20:totalSupply",
    }),
  };
}

module.exports = {
  timetravel: false,
  solana: { tvl: solanaTVL },
  cronos: { tvl: cronosTVL },
};
