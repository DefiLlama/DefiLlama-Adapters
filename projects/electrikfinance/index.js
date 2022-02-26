const Caver = require("caver-js");
const poolStatAbi = require("./abi/poolstat.json");
const { toUSDTBalances } = require("../helper/balances");

const klaytnVaults = {
  "NR-KLAY LP": {
    poolStat: "0x3412E7B2A2a4cfaC41C1e2B504C25C520a141f44",
    vaultToken: "0xCF75EB0134e9a90974cbDAA180fD43F0eab79468",
  },

  "NR-KDAI LP": {
    poolStat: "0x3412E7B2A2a4cfaC41C1e2B504C25C520a141f44",
    vaultToken: "0x66021A334d9FA6FCF22386A90973B69A2BBA216C",
  },

  "NR-KETH LP": {
    poolStat: "0x3412E7B2A2a4cfaC41C1e2B504C25C520a141f44",
    vaultToken: "0xC486E80ce76f143fb9a924758305f19Dd6368564",
  },

  "NR-KUSDT LP": {
    poolStat: "0x3412E7B2A2a4cfaC41C1e2B504C25C520a141f44",
    vaultToken: "0x1129494aCB4f42BDb716322Af23F333E9B5f471B",
  },

  "NR-KSP LP": {
    poolStat: "0x3412E7B2A2a4cfaC41C1e2B504C25C520a141f44",
    vaultToken: "0xb8B2e0858e0e09a29a4394f9791e632C048A340f",
  },

  "NR-KORC LP": {
    poolStat: "0x3412E7B2A2a4cfaC41C1e2B504C25C520a141f44",
    vaultToken: "0x7e555C8A413a91764E8b18B539C424F751b1B5D5",
  },

  "NR-KBNB LP": {
    poolStat: "0x3412E7B2A2a4cfaC41C1e2B504C25C520a141f44",
    vaultToken: "0x1C3F5D0e7dc5799540E5eCD641BBD6997c4cA629",
  },

  "NR-KXRP LP": {
    poolStat: "0x3412E7B2A2a4cfaC41C1e2B504C25C520a141f44",
    vaultToken: "0x437824EF022B985D0770f8f8Dd6065A661434174",
  },

  "NR-KWBTC LP": {
    poolStat: "0x3412E7B2A2a4cfaC41C1e2B504C25C520a141f44",
    vaultToken: "0x08f0eFA8069d046b8A2a118Fe6ED246F0f21Cbaa",
  },

  "KLAY-PALA LP": {
    poolStat: "0x60df5F18d25140D514BEa27f46fb633DAD78BcE2",
    vaultToken: "0x3541835aCB25513801f9da4093f7aB1275c61318",
  },

  "PALA-KUSDT LP": {
    poolStat: "0x60df5F18d25140D514BEa27f46fb633DAD78BcE2",
    vaultToken: "0x4a23B0030f72Db1942e00F72d462cD5a42CD743d",
  },

  "KXRP-KUSDT LP": {
    poolStat: "0x60df5F18d25140D514BEa27f46fb633DAD78BcE2",
    vaultToken: "0xFf4B28146182A0c1741F51281ad61aB23d4a069f",
  },

  "KBNB-KUSDT LP": {
    poolStat: "0x60df5F18d25140D514BEa27f46fb633DAD78BcE2",
    vaultToken: "0x8D3c68a3b44E9bff475Aa1C68937e05CcAD77060",
  },

  "KETH-KLAY roundrobin LP": {
    poolStat: "0x968cCa211003b02eD434734155fB6daB8A79B33d",
    vaultToken: "0x302CF043c80DF7355B543B35580F66431CE2A21a",
  },

  "KLAY-KPs LP": {
    poolStat: "0x7fAc09BE06710EFf9202C213d0Ccb44b992dB107",
    vaultToken: "0x64E2cf0300D9D7b70FA0eC6564689e71133740eb",
  },

  "KUSDT-KP LP": {
    poolStat: "0xa1E112a9B1A027ff4508cDa62d573E31A7176432",
    vaultToken: "0xAF7e26c728aD3E8C5b2Fac828Db055aB3ADEDE6C",
  },

  "KSP-MKC LP": {
    poolStat: "0x7fAc09BE06710EFf9202C213d0Ccb44b992dB107",
    vaultToken: "0xf3AbC0FC7eBE89FACe6732D00EbC32Fbc8D628a8",
  },

  "KLAY-MKC LP": {
    poolStat: "0x7fAc09BE06710EFf9202C213d0Ccb44b992dB107",
    vaultToken: "0x955c243D1DF6F31BeBbD54028d97F980C43F6373",
  },

  "INS-KSP LP": {
    poolStat: "0x7fAc09BE06710EFf9202C213d0Ccb44b992dB107",
    vaultToken: "0xAe2f4A15132116548BE3d45855fF5D907fAc01c8",
  },

  "KLAY-INS LP": {
    poolStat: "0x7fAc09BE06710EFf9202C213d0Ccb44b992dB107",
    vaultToken: "0x01daE822d69fe2C8D291f42fC69EfeFAf8B2ceFB",
  },

  "KLAY-NGIT LP": {
    poolStat: "0x7fAc09BE06710EFf9202C213d0Ccb44b992dB107",
    vaultToken: "0xA43826a3892aBc7207530fB222d984dABE3d4b0a",
  },

  "KSP-NGIT LP": {
    poolStat: "0x7fAc09BE06710EFf9202C213d0Ccb44b992dB107",
    vaultToken: "0xf5379798a5d597323A0ea85bf71d3277cf3E4700",
  },

  "KUSDT-CLA LP": {
    poolStat: "0xFC4Bb964892419a2510f14367AB02d943a648390",
    vaultToken: "0xFcc9b00173a7451f84ac6901ca9D1439D8130a91",
  },

  "CLA-KLAY LP": {
    poolStat: "0xFC4Bb964892419a2510f14367AB02d943a648390",
    vaultToken: "0xCEf4b9B84D8492957D9693bCeBAA31F3414495d8",
  },

  "KDAI-KUSDT LP": {
    poolStat: "0xFC4Bb964892419a2510f14367AB02d943a648390",
    vaultToken: "0x5467A238FaDB2eFe23d3A73384180C1a3Fc8f242",
  },

  "UFO-KLAY LP": {
    poolStat: "0x1a703Eea84A9E3e099770CbDCD9378b67470ECb7",
    vaultToken: "0xf5EAD115C0d6fCe24BAA240412F527C70ba92de0",
  },

  "KWBTC-KETH LP": {
    poolStat: "0x1a703Eea84A9E3e099770CbDCD9378b67470ECb7",
    vaultToken: "0xE3AE9902FCD15E763c5a1DE523642CAa05798803",
  },

  "KETH-KLAY LP": {
    poolStat: "0x1a703Eea84A9E3e099770CbDCD9378b67470ECb7",
    vaultToken: "0xf5ddC9e25bA299D970F01F850b69fE59F8f25B86",
  },

  ibKLAY: {
    poolStat: "0x6285595cE3c03605425894F173cF8970Aad02B75",
    vaultToken: "0x1d6949D2fCe336Ac4055C98d701092Bb1C1c796b",
  },
  ibKUSDT: {
    poolStat: "0x6285595cE3c03605425894F173cF8970Aad02B75",
    vaultToken: "0x3CA705594708D9824Bc660efC1F164AE05edE142",
  },
};

const coinAddress = "0x0000000000000000000000000000000000000000";

async function klaytn() {
  const provider = new Caver.providers.HttpProvider(
    "https://public-node-api.klaytnapi.com/v1/cypress"
  );
  const caver = new Caver(provider);
  let klaytnTVL = 0;
  
  for (const token in klaytnVaults) {
    const poolStatContract = new caver.klay.Contract(
      poolStatAbi,
      klaytnVaults[token].poolStat
    );
    const balance = await poolStatContract.methods
      .tvl(klaytnVaults[token].vaultToken)
      .call();
    klaytnTVL += Number(balance);
  }
  klaytnTVL = klaytnTVL / 1e18;
  return toUSDTBalances(klaytnTVL);
}
module.exports = {
  klaytn: {
    tvl: klaytn,
  },
};

