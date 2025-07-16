const STOAS_ADDRESS = '0x804c0AB078E4810eDBeC24a4ffB35ceb3e5BD61b';
const ABI = {
  totalOAS: 'function totalOAS() view returns (uint256)'
}

async function tvl(api) {
  const totalOAS = await api.call({
    target: STOAS_ADDRESS,
    abi: ABI.totalOAS,
  });

  return {
    "coingecko:oasys": totalOAS / 1e18
  }
}

module.exports = {
  oas: { tvl },
};
