const { sumBoringTvl } = require("../helper/boringVault");

const LENS = '0x5232bc0F5999f8dA604c42E1748A13a170F94A1B'

const vaults = [
    { id: '0xF4e20B420482F8bEd60DDc4836890b3c4eCFD3E5', accountant: '0xd0E9563E2e77a3655Fa765c9aFA51d7898DCce1B', lens: LENS }, // primeUSD
    { id: '0xccee5D9125Dcb41156e67C92a92BC0608D720660', accountant: '0x71A8166096F86EACa45AD97b9B4F34Bc97FfC47c', lens: LENS }, // primeETH
    { id: '0xd57C84F393B01ec01E1F42a9977795b2bca95837', accountant: '0x7c6c4554eC10b4BdA09d7a6fa9Be423896942A31', lens: LENS }, // primeBTC
    { id: '0x3AF6CBd76FDb0C6315B7748Ba11243830565e783', accountant: '0x1d7e0B3070d80899bCd61A9c484780F54B1543D6', lens: LENS }, // primeBERA
]

module.exports = {
    doublecounted: true,
    berachain: { tvl: (api) => sumBoringTvl({ vaults, api }) },
}