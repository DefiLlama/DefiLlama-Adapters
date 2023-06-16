// The provided address should be the all the BorrowingVaults and YieldVault contracts that returns
// totalAssets() for the indicated asset.
const arbitrumContracts = {
  weth: [
    "0x9201E10E4C269D6528d2d153f2145348A399f540",
    "0x4181d63c414327682B1cb1d6265CA47d82C46e93",
    "0xA68DD672f0D52277a740a5f6864Bd3A0a30462f8",
    "0xB9E7aCCb61031CA364C3232E986D9152b61006c2",
    "0xe2A42570C5b0d764f615368A50bE40EfB5D91D9A"
  ],
};

module.exports = {
  arbitrumContracts,
};