const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const VAULT_V2 = '0xde6b4964c4384bcdfa150a4a8be9865c5b91e29c';
const config = { owner: VAULT_V2, fetchCoValentTokens: true, blacklistedTokens: ['0x594f9274e08ba6c5760bacfba795b1879af17255'], }
const tvl = sumTokensExport(config)

module.exports = {
  ethereum: { tvl },
  bsc: { tvl: sumTokensExport({
    owner: VAULT_V2, fetchCoValentTokens: true,
    tokens: [
      ADDRESSES.bsc.USDT, // BSC-USD
      ADDRESSES.bsc.ETH, //Bpeg ETH
      ADDRESSES.bsc.BTCB, // btcb
      ADDRESSES.bsc.USDC, // usdc
      "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF", // sol
      "0x1Fa4a73a3F0133f0025378af00236f3aBDEE5D63", // near
      "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE", // xrp
      "0x1CE0c2827e2eF14D5C4f29a091d735A204794041", // shib
      "0x111111111117dC0aa78b770fA6A738034120C302", // 1inch
      "0x045c4324039dA91c52C55DF5D785385Aab073DcF", // bCFX
      "0xbA2aE424d960c26247Dd6c32edC70B295c744C43", // doge
      "0x4B0F1812e5Df2A09796481Ff14017e6005508003", // twt
      "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E", // floki
      "0x0Eb3a705fc54725037CC9e008bDede697f62F335", // atom
      "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", // link
      "0xCC42724C6683B7E57334c4E856f4c9965ED682bD", // matic
      "0x56b6fB708fC5732DEC1Afc8D8556423A2EDcCbD6", // eos
      ADDRESSES.bsc.BUSD, // busd
      "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1", // uni
      "0xD41FDb03Ba84762dD66a0af1a6C8540FF1ba5dfb", // sfp
      "0xAD29AbB318791D579433D831ed122aFeAf29dcfe", // ftm
      "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b", // stg
      "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402", // dot
      ADDRESSES.bsc.WBNB, // wbnb
      "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", // cake
      "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", // dai
      "0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0", // axs
      "0x031b41e504677879370e9DBcF937283A8691Fa7f", // fet
      "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", // ada
      "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153", // fil
    ]}) },
  polygon: { tvl },
  avax: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
  base: { tvl },
  linea: { tvl },
  manta: { tvl: sumTokensExport({ ...config, fetchCoValentTokens: false, tokens: Object.values(ADDRESSES.manta) }) },

  hallmarks: [
    [1688688480, "ReHold V2 Launch"],
    [1689743327, "Ethereum Deployment"],
    [1690898169, "Limit Orders Launch"],
    [1698624000, "ReHold Swaps Launch"],
  ],
};
