async function zetaTvl(api) {
  api.addGasToken(await api.call({target: '0x45334a5b0a01ce6c260f2b570ec941c680ea62c0', abi: 'uint256:getTotalPooledZETA'}))
}

const btrZTokens = [
  '0xd53E6f1d37f430d84eFad8060F9Fec558B36F6fa', // zbtc
  '0xdc842A54dB9E6136c7972eA863Efd6CE0d45602c', // zordi
  '0xb86e3Cc68d9C56E1b87DEddF49c4A6fdaaF04A82' // zsats
];

async function btrTvl(api) {
  let totalSupply = 0;
  for (const token of btrZTokens) {
    const supply = await api.call({ abi: 'uint256:totalSupply', target: token });
    totalSupply += parseInt(supply, 10);
    api.add(token, supply);
  }
  return api.getBalances();
}

module.exports = { zeta: { tvl: zetaTvl }, btr: { tvl: btrTvl } }
