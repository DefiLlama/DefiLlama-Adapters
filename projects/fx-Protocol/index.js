const treasuries = [
  "0x0e5CAA5c889Bdf053c9A76395f62267E653AFbb0", 
  "0xED803540037B0ae069c93420F89Cd653B6e3Df1f", 
  "0xcfEEfF214b256063110d3236ea12Db49d2dF2359", 
  "0x781BA968d5cc0b40EB592D5c8a9a3A4000063885", 
  "0x38965311507D4E54973F81475a149c09376e241e", 
  "0x63Fe55B3fe3f74B42840788cFbe6229869590f83", 
  "0xdFac83173A96b06C5D6176638124d028269cfCd2" 
];
const cvxAddress = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B";
const aCVX = "0xb0903Ab70a7467eE5756074b31ac88aEBb8fB777";
const uniBTC = "0x004E9C3EF86bc1ca1f0bB5C7662861Ee93350568";
const uniBTC_Genesis_Gauge = "0x1D20671A21112E85b03B00F94Fd760DE0Bef37Ba"
module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};

async function getACRVInfo(api) {
  const totalAssets = await api.api.call(
    {
      target: aCVX,
      abi: 'uint256:totalAssets',
    })
  const totalSupply = await api.api.call(
    {
      target: aCVX,
      abi: 'uint256:totalSupply',
    })
  return totalAssets / totalSupply
}

async function getUniBTCTvl(api) {
  const totalSupply = await api.api.call(
    {
      target: uniBTC_Genesis_Gauge,
      abi: 'uint256:totalSupply',
    })
  return totalSupply
}
async function tvl(api) {
  const aCvxRate = await getACRVInfo(api)
  const tokens = await api.multiCall({ abi: 'address:baseToken', calls: treasuries })
  const bals = await api.multiCall({ abi: 'uint256:totalBaseToken', calls: treasuries })
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })
  const uniBTCTvl = await getUniBTCTvl(api)
  bals.forEach((bal, i) => {
    if (tokens[i].toLowerCase() === aCVX.toLowerCase()) {
      api.add(cvxAddress, bal*aCvxRate / 10 ** (18 - decimals[i]))  
    } else {
      api.add(tokens[i], bal / 10 ** (18 - decimals[i]))
    }
  })
  api.add(uniBTC, uniBTCTvl)
}