const { sumERC4626VaultsExport } = require('../helper/erc4626');
const { sumTokens2 } = require('../helper/unwrapLPs');
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const morphoVaults = {
  '0x5eEC795d919FA97688Fb9844eeB0072E6B846F9d': '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
  '0x53A333e51E96FE288bC9aDd7cdC4B1EAD2CD2FfA': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
  '0x0571362ba5EA9784a97605f57483f865A37dBEAA': '0xBe6727B535545C67d5cAa73dEa54865B92CF7907',
  '0xd19e3d00f8547f7d108abfd4bbb015486437b487': '0x5555555555555555555555555555555555555555',
  '0x4346C98E690c17eFbB999aE8e1dA96B089bE320b': '0x9ab96A4668456896d45c301Bc3A15Cee76AA7B8D',
  '0xe5ADd96840F0B908ddeB3Bd144C0283Ac5ca7cA0': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
  '0xD3A9Cb7312B9c29113290758f5ADFe12304cd16A': '0x0aD339d66BF4AeD5ce31c64Bc37B3244b6394A77',
  '0x3Bcc0a5a66bB5BdCEEf5dd8a659a4eC75F3834d8': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
  '0x51F64488d03D8B210294dA2BF70D5db0Bc621B0c': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // Re7 USDT0
  '0x182b318A8F1c7C92a7884e469442a610B0e69ed2': '0x5555555555555555555555555555555555555555', // Re7 HYPE
  '0x92B518e1cD76dD70D3E20624AEdd7D107F332Cff': '0x5555555555555555555555555555555555555555', // Hyperithm HYPE
  '0x264a06Fd7A7C9E0Bfe75163b475E2A3cc1856578': '0x5555555555555555555555555555555555555555', // Gauntlet HYPE
};

const standaloneVaults = {
  '0x5e105266db42f78fa814322bce7f388b4c2e61eb': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // USDT0
  '0x6EB6724D8D3D4FF9E24d872E8c38403169dC05f8': '0xf4D9235269a96aaDaFc9aDAe454a0618eBE37949',  // xAUT
  '0x81e064d0eB539de7c3170EDF38C1A42CBd752A76': '0x5555555555555555555555555555555555555555',  // lstHYPE
  '0x441794D6a8F9A3739F5D4E98a728937b33489D29': '0x5555555555555555555555555555555555555555',  // beHYPE
  '0xD66d69c288d9a6FD735d7bE8b2e389970fC4fD42': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',  // wVLP
  '0x949a7250Bb55Eb79BC6bCC97fCd1C473DB3e6F29': '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',  // dnHYPE
};

const sixDecimalTokens = [
  '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // USDT0
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
  hyperliquid: {
    tvl: async (api) => {
      await sumERC4626VaultsExport({ 
        vaults: ['0x96C6cBB6251Ee1c257b2162ca0f39AA5Fa44B1FB', '0xc061d38903b99aC12713B550C2CB44B221674F94'], // hbHYPE, hbBTC
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
