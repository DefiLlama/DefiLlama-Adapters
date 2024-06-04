const treasuries = [
  "0x0e5CAA5c889Bdf053c9A76395f62267E653AFbb0",
  "0xED803540037B0ae069c93420F89Cd653B6e3Df1f",
  "0xcfEEfF214b256063110d3236ea12Db49d2dF2359",
  "0x781BA968d5cc0b40EB592D5c8a9a3A4000063885",
  "0x38965311507D4E54973F81475a149c09376e241e",
  "0x63Fe55B3fe3f74B42840788cFbe6229869590f83",
];

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:baseToken', calls: treasuries })
  const bals = await api.multiCall({ abi: 'uint256:totalBaseToken', calls: treasuries })
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })
  bals.forEach((bal, i) => api.add(tokens[i], bal / 10 ** (18 - decimals[i])))
}