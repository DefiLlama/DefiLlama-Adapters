const ADDRESSES = require('../helper/coreAssets.json')
const { sumERC4626VaultsExport } = require('../helper/erc4626');
const { sumTokens2 } = require('../helper/unwrapLPs');
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const morphoVaults = {
  '0x5eEC795d919FA97688Fb9844eeB0072E6B846F9d': ADDRESSES.arbitrum.USDe,
  '0x53A333e51E96FE288bC9aDd7cdC4B1EAD2CD2FfA': ADDRESSES.corn.USDT0,
  '0x0571362ba5EA9784a97605f57483f865A37dBEAA': '0xBe6727B535545C67d5cAa73dEa54865B92CF7907',
  '0xd19e3d00f8547f7d108abfd4bbb015486437b487': ADDRESSES.hyperliquid.WHYPE,
  '0x4346C98E690c17eFbB999aE8e1dA96B089bE320b': '0x9ab96A4668456896d45c301Bc3A15Cee76AA7B8D'
};

const standaloneVaults = {
  '0x5e105266db42f78fa814322bce7f388b4c2e61eb': ADDRESSES.corn.USDT0, // USDT0
  '0x6EB6724D8D3D4FF9E24d872E8c38403169dC05f8': '0xf4D9235269a96aaDaFc9aDAe454a0618eBE37949'  // xAUT
};

const sixDecimalTokens = [
  ADDRESSES.corn.USDT0, // USDT0
  '0x9ab96A4668456896d45c301Bc3A15Cee76AA7B8D', // rUSDC
  '0xf4D9235269a96aaDaFc9aDAe454a0618eBE37949'  // xAUT
];

const adjustDecimals = (amount, from, to = 6) => {
  return new BigNumber(amount)
    .times(new BigNumber(10).pow(to))
    .div(new BigNumber(10).pow(from))
    .toFixed(0);
};

const processVaults = async (api, vaults) => {
  const [supplies, decimals] = await Promise.all([
    sdk.api.abi.multiCall({
      calls: Object.keys(vaults).map(v => ({ target: v })),
      abi: 'erc20:totalSupply',
      chain: 'hyperliquid'
    }),
    sdk.api.abi.multiCall({
      calls: Object.keys(vaults).map(v => ({ target: v })),
      abi: 'erc20:decimals',
      chain: 'hyperliquid'
    })
  ]);

  supplies.output.forEach((data, i) => {
    const vault = data.input.target;
    const underlying = vaults[vault];
    const vaultDecimals = decimals.output[i].output;
    const amount = sixDecimalTokens.includes(underlying)
      ? adjustDecimals(data.output, vaultDecimals)
      : data.output;
    api.add(underlying, amount);
  });
};

module.exports = {
  doublecounted: true,
  methodology: 'Measures TVL by calculating all tokens held by each vault.',
  start: 1738368000,
  ethereum: {
    tvl: async (api) => sumTokens2({ 
      api, 
      owners: [
        '0x9E3C0D2D70e9A4BF4f9d5F0A6E4930ce76Fed09e',
        '0x9920d2075A350ACAaa4c6D00A56ebBEeD021cD7f',
        '0x340116F605Ca4264B8bC75aAE1b3C8E42AE3a3AB'
      ], 
      tokens: [
        ADDRESSES.ethereum.WETH, ADDRESSES.ethereum.WBTC, 
        ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, 
        '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110', ADDRESSES.ethereum.STETH, 
        ADDRESSES.ethereum.WSTETH, '0x8DB2350D78aBc13f5673A411D4700BCF87864dDE', 
        ADDRESSES.ethereum.EBTC, '0x094c0e36210634c3CfA25DC11B96b562E0b07624', 
        ADDRESSES.ethereum.cbBTC, ADDRESSES.ethereum.LBTC, 
        '0x7A56E1C57C7475CCf742a1832B028F0456652F97', '0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e', 
        ADDRESSES.mantle.cmETH, '0x7122985656e38BDC0302Db86685bb972b145bD3C', 
        ADDRESSES.ethereum.WEETH, '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7', 
        '0xf951E335afb289353dc249e82926178EaC7DEd78', '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0'
      ]
    })
  },
  hyperliquid: {
    tvl: async (api) => {
      await sumERC4626VaultsExport({ 
        vaults: ['0x96C6cBB6251Ee1c257b2162ca0f39AA5Fa44B1FB', '0xc061d38903b99aC12713B550C2CB44B221674F94'], 
        isOG4626: true 
      })(api);
      
      await Promise.all([
        processVaults(api, standaloneVaults),
        processVaults(api, morphoVaults)
      ]);

      return api.getBalances();
    }
  }
};
