const { sumERC4626VaultsExport } = require('../helper/erc4626');
const { sumTokens2 } = require('../helper/unwrapLPs');
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const USDT0 = '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb';
const USDT0_VAULT = '0x5e105266db42f78fa814322bce7f388b4c2e61eb';

const morphoVaults = {
  '0x5eEC795d919FA97688Fb9844eeB0072E6B846F9d': '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
  '0x53A333e51E96FE288bC9aDd7cdC4B1EAD2CD2FfA': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
  '0x0571362ba5EA9784a97605f57483f865A37dBEAA': '0xBe6727B535545C67d5cAa73dEa54865B92CF7907',
  '0xd19e3d00f8547f7d108abfd4bbb015486437b487': '0x5555555555555555555555555555555555555555'
};

const adjustDecimals = (amount, from, to = 6) => {
  return new BigNumber(amount)
    .times(new BigNumber(10).pow(to))
    .div(new BigNumber(10).pow(from))
    .toFixed(0);
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
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0xdAC17F958D2ee523a2206206994597C13D831ec7', 
        '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110', '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', 
        '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', '0x8DB2350D78aBc13f5673A411D4700BCF87864dDE', 
        '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642', '0x094c0e36210634c3CfA25DC11B96b562E0b07624', 
        '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', '0x8236a87084f8B84306f72007F36F2618A5634494', 
        '0x7A56E1C57C7475CCf742a1832B028F0456652F97', '0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e', 
        '0xE6829d9a7eE3040e1276Fa75293Bde931859e8fA', '0x7122985656e38BDC0302Db86685bb972b145bD3C', 
        '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee', '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7', 
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
      
      const [supply, decimals] = await Promise.all([
        sdk.api.erc20.totalSupply({ target: USDT0_VAULT, chain: 'hyperliquid' }),
        sdk.api.erc20.decimals(USDT0_VAULT, 'hyperliquid')
      ]);
      
      api.add(USDT0, adjustDecimals(supply.output, decimals.output));

      const [supplies, vaultDecimals] = await Promise.all([
        sdk.api.abi.multiCall({
          calls: Object.keys(morphoVaults).map(v => ({ target: v })),
          abi: 'erc20:totalSupply',
          chain: 'hyperliquid'
        }),
        sdk.api.abi.multiCall({
          calls: Object.keys(morphoVaults).map(v => ({ target: v })),
          abi: 'erc20:decimals',
          chain: 'hyperliquid'
        })
      ]);

      supplies.output.forEach((data, i) => {
        const vault = data.input.target;
        const underlying = morphoVaults[vault];
        const decimals = vaultDecimals.output[i].output;
        const amount = underlying === USDT0 
          ? adjustDecimals(data.output, decimals)
          : data.output;
        api.add(underlying, amount);
      });

      return api.getBalances();
    }
  }
};
