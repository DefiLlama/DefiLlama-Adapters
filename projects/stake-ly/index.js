async function tvl(api) {
  const stKlayAddress = "0xF80F2b22932fCEC6189b9153aA18662b15CC9C00"
  const pooledKlay = await api.call({ abi: 'uint256:totalStaking', target: stKlayAddress })
  api.addGasToken(pooledKlay)
}

module.exports = {
  methodology:
    "TVL is KLAY staked by the users and rewards accrued from node staking",
  start: '2022-09-19',
  klaytn: {
    tvl,
  },
};
