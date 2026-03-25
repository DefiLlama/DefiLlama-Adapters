const ADDRESSES = require("../helper/coreAssets.json");

const boringVaultsV0Scroll = [
  {
    name: "Liquid ETH",
    vault: "0xf0bb20865277aBd641a307eCe5Ee04E79073416C",
    accountant: "0x0d05D94a5F1E76C18fbeB7A13d17C8a314088198",
    teller: "0x5c135e8eC99557b412b9B4492510dCfBD36066F5",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 12748860, 
    baseAsset: ADDRESSES.scroll.WETH,
  },
    {
    name: "Liquid USD",
    vault: "0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C",
    accountant: "0xc315D6e14DDCDC7407784e2Caf815d131Bc1D3E7",
    teller: "0x221Ea02d409074546265CCD1123050F4D498ef64",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 12749211, 
    baseAsset: ADDRESSES.scroll.USDC_e,
  },
    {
    name: "Liquid BTC",
    vault: "0x5f46d540b6eD704C3c8789105F30E075AA900726",
    accountant: "0xEa23aC6D7D11f6b181d6B98174D334478ADAe6b0",
    teller: "0x9E88C603307fdC33aA5F26E38b6f6aeF3eE92d48",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 13951017, 
    baseAsset: ADDRESSES.scroll.WBTC,
  },
    {
    name: "eBTC",
    vault: ADDRESSES.ethereum.EBTC,
    accountant: "0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F",
    teller: "0xe19a43B1b8af6CeE71749Af2332627338B3242D1",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 12677428, 
    baseAsset: ADDRESSES.scroll.WBTC,
  },
    {
    name: "eUSD",
    vault: ADDRESSES.ethereum.EUSD,
    accountant: "0xEB440B36f61Bf62E0C54C622944545f159C3B790",
    teller: "0xCc9A7620D0358a521A068B444846E3D5DebEa8fA",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 12775217, 
    baseAsset: ADDRESSES.scroll.USDC_e,
  },
];

module.exports = {
  boringVaultsV0Scroll,
};