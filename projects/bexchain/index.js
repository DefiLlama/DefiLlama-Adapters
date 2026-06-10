const sdk = require('@defillama/sdk');

const factory = '0xe6ade1cf5b60d9f135e1d8c003b1e4bf9a897fd2';

async function tvl(api) {
  // Memanggil jumlah total pasangan pool menggunakan ABI standar terpisah
  const poolLength = await api.call({
    target: factory,
    abi: "function allPairsLength() view returns (uint256)",
    chain: 'bexchain'
  });

  // Mengambil semua alamat pool yang terdaftar di Factory
  const pairCalls = Array.from({ length: Number(poolLength) }, (_, i) => i);
  const pairs = await api.call({
    target: factory,
    abi: "function allPairs(uint256) view returns (address)",
    calls: pairCalls,
    chain: 'bexchain'
  });

  // Mengambil data saldo cadangan token dari semua pool secara otomatis
  const reserves = await api.call({
    abi: "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    calls: pairs,
    chain: 'bexchain'
  });

  const tokens = await Promise.all([
    api.call({ abi: "function token0() view returns (address)", calls: pairs, chain: 'bexchain' }),
    api.call({ abi: "function token1() view returns (address)", calls: pairs, chain: 'bexchain' })
  ]);

  // Memasukkan total saldo aset ke dalam pembukuan DefiLlama
  reserves.forEach((res, i) => {
    api.add(tokens[0][i], res.reserve0);
    api.add(tokens[1][i], res.reserve1);
  });
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  bexchain: {
    tvl
  }
};
