const { sumTokens2 } = require("../helper/unwrapLPs");

const contracts = {
  tlx: "0xD9cC3D70E730503E7f28c1B407389198c4B75FA2",
  locker: "0xc068c3261522c97ff719dc97c98c63a1356fef0f",
}

async function staking(api) {
  const lockedTlxBalance = await api.call({
    abi: "uint256:totalStaked",
    target: contracts.locker,
  });

  api.addToken(contracts.tlx, lockedTlxBalance)
  return sumTokens2({ api })
}

module.exports = {
  start: 1712731500,
  methodology: "Total TLX locked in the genesis locker contract.",
  optimism: {
    tvl: () => ({}),
    staking: staking,
  },
};
