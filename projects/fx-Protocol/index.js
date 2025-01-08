const ADDRESSES = require('../helper/coreAssets.json')
const treasuries = [
  "0x0e5CAA5c889Bdf053c9A76395f62267E653AFbb0",
  "0xED803540037B0ae069c93420F89Cd653B6e3Df1f",
  "0xcfEEfF214b256063110d3236ea12Db49d2dF2359",
  "0x781BA968d5cc0b40EB592D5c8a9a3A4000063885",
  "0x38965311507D4E54973F81475a149c09376e241e",
  "0x63Fe55B3fe3f74B42840788cFbe6229869590f83",
  "0xdFac83173A96b06C5D6176638124d028269cfCd2"
];
const baseTokenRate = [
  // '',
  '0x81A777c4aB65229d1Bf64DaE4c831bDf628Ccc7f',
  '0x7ceD6167b5A08111dC8d0D2f9F7E482c4Da62506',
  '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
  '0xE3fF08070aB3aD7eeE7a1cab35105F27DF8EfF10',
  // '',
  '0x6Eb03222179F83126735D7E9FdE94571D716D399'
]
const cvxAddress = ADDRESSES.ethereum.CVX;
const aCVX = "0xb0903Ab70a7467eE5756074b31ac88aEBb8fB777";
const uniBTC = "0x004E9C3EF86bc1ca1f0bB5C7662861Ee93350568";
const uniBTC_Genesis_Gauge = "0x1D20671A21112E85b03B00F94Fd760DE0Bef37Ba"
const fxUSD_stabilityPool = "0x65C9A641afCEB9C0E6034e558A319488FA0FA3be"
const fxUSD_stabilityPool_Gauge = "0xEd92dDe3214c24Ae04F5f96927E3bE8f8DbC3289"

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};

async function getACVXInfo(api) {
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

async function getBaseTokenRate(api) {
  const rates = await api.multiCall({ abi: 'uint256:getRate', calls: baseTokenRate })
  rates.splice(0, 0, 1e18);
  rates.splice(5, 0, 1e18);
  return rates
}

async function tvl(api) {
  const aCvxRate = await getACVXInfo(api)
  const rates = await getBaseTokenRate(api)
  const tokens = await api.multiCall({ abi: 'address:baseToken', calls: treasuries })
  const bals = await api.multiCall({ abi: 'uint256:totalBaseToken', calls: treasuries })
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })
  bals.forEach((bal, i) => {
    if (tokens[i].toLowerCase() === aCVX.toLowerCase()) {
      api.add(cvxAddress, bal / (rates[i] / 1e18) * aCvxRate / 10 ** (18 - decimals[i]))
    } else {
      api.add(tokens[i], bal / (rates[i] / 1e18) / 10 ** (18 - decimals[i]))
    }
  })

  const tokensAndOwners = [[uniBTC, uniBTC_Genesis_Gauge], [ADDRESSES.ethereum.USDC, fxUSD_stabilityPool]]
  return api.sumTokens({ tokensAndOwners })
}