const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Optimism = [
  {
    name: "Liquid ETH",
    vault: "0xf0bb20865277aBd641a307eCe5Ee04E79073416C",
    accountant: "0x0d05D94a5F1E76C18fbeB7A13d17C8a314088198",
    teller: "0x9AA79C84b79816ab920bBcE20f8f74557B514734",
    lens: "0xe0efe934dc4744090e8ef93f1d125e4015a857fe",
    startBlock: 123081511,
    baseAsset: ADDRESSES.optimism.WETH_1,
  },
  {
    name: "Liquid BTC",
    vault: "0x5f46d540b6eD704C3c8789105F30E075AA900726",
    accountant: "0xEa23aC6D7D11f6b181d6B98174D334478ADAe6b0",
    teller: "0x8Ea0B382D054dbEBeB1d0aE47ee4AC433C730353",
    lens: "0xe0efe934dc4744090e8ef93f1d125e4015a857fe",
    startBlock: 149698604,
    baseAsset: ADDRESSES.optimism.WBTC,
  },
  {
    name: "Liquid USD",
    vault: "0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C",
    accountant: "0xc315D6e14DDCDC7407784e2Caf815d131Bc1D3E7",
    teller: "0x4DE413a26fC24c3FC27Cc983be70aA9c5C299387",
    lens: "0xe0efe934dc4744090e8ef93f1d125e4015a857fe",
    startBlock: 149698249,
    baseAsset: ADDRESSES.optimism.USDC_CIRCLE,
  },
  {
    name: "Staked ETHFI",
    vault: "0x86B5780b606940Eb59A062aA85a07959518c0161",
    accountant: "0x05A1552c5e18F5A0BB9571b5F2D6a4765ebdA32b",
    teller: "0x35dD2463fA7a335b721400C5Ad8Ba40bD85c179b",
    lens: "0xe0efe934dc4744090e8ef93f1d125e4015a857fe",
    startBlock: 149699005,
    baseAsset: ADDRESSES.optimism.ETHFI,
  },
];

module.exports = {
  boringVaultsV0Optimism,
};
