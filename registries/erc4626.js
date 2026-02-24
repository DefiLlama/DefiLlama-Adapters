const { sumERC4626VaultsExport2 } = require('../projects/helper/erc4626')
const { buildProtocolExports } = require('./utils')

function erc4626ExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    const vaults = Array.isArray(config) ? config : config.vaults
    result[chain] = { tvl: sumERC4626VaultsExport2({ vaults }) }
  })
  return result
}

const configs = {
  'webera': {
    start: '2025-02-18',
    berachain: [
      '0x55a050f76541C2554e9dfA3A0b4e665914bF92EA',
      '0x4eAD3867554E597C7B0d511dC68ceaD59286870D',
      '0xCf1bfB3F9dc663F6775f999239E646e0021CCc0B',
      '0x396A3D0B799B1a0B1EaA17e75B4DEa412400860b',
      '0xc06B9E2a936A656c13df32a6504C8422189203CE',
    ],
  },
  'pok-vault': {
    bsc: ['0x5a791CCAB49931861056365eBC072653F3FA0ba0'],
  },
  'goldlink': {
    methodology: 'Delta neutral farming in GMX Vault',
    start: '2024-05-25',
    doublecounted: true,
    arbitrum: ['0xd8dd54df1a7d2ea022b983756d8a481eea2a382a'],
    avax: ['0xbE6eB54D1e96CC59338BE9A281d840AcE82df095'],
  },
  'kaia-superEarn': {
    klaytn: [
      '0x3B37DB3AC2a58f2daBA1a7d66d023937d61Fc95b',
      '0x4E4654cE4Ca7ff0ba66a0A4a588A4bd55A6f9A33',
    ],
  },
  'k-bit': {
    methodology: "K-BIT Vault is a core component of the K-BIT ecosystem, enabling users to participate in the platform by depositing USDT and receiving KLP tokens in return.",
    klaytn: [
      '0x2fb5AAbf9bbc7303eB48D154F57de5cCe158FC2c',
      '0x918d506f1adea933727154c67594bd25010db17b',
    ],
  },
  'swell-swbtc': {
    doublecounted: true,
    ethereum: ['0x8DB2350D78aBc13f5673A411D4700BCF87864dDE'],
  },
  'snowbl-capital': {
    base: ['0xd61bfc9ca1d0d2b03a3dd74e2ab81df8e5f606e8'],
  },
  'return-finance': {
    doublecounted: true,
    ethereum: [
      '0x4D7F26a161a3e1fbE10C11e1c9abC05Fa43DdE67',
      '0x4cba5780Dcbee1c8B5220D24f4F54e14D796a31C',
      '0xD8785CDae9Ec24b8796c45E3a2D0F7b03194F826',
      '0xc2d4d9070236bA4ffefd7cf565eb98d11bFeB8E1',
      '0x2C2f0FFbFA1B8b9C85400f1726e1bc0892e63D9F',
    ],
    avax: [
      '0x0271A46c049293448C2d4794bCD51f953Bf742e8',
      '0x3A3dAdbca3ec5a815431f45eca33EF1520388Ef2',
    ],
    polygon: ['0x0271A46c049293448C2d4794bCD51f953Bf742e8'],
    base: [
      '0x367F44Fbd5a9c2fDBF18D98F0DAbF15e22da7194',
      '0x3936bC108A503c301e4A7D9A8937ae5ab1B10Fd6',
    ],
  },
  'kelp-gain': {
    doublecounted: true,
    methodology: "TVL corresponds to the sum of rsETH from all active loans managed by the pool and the rsETH balance held within the pool across all of the GAIN vaults.",
    ethereum: [
      '0xe1B4d34E8754600962Cd944B535180Bd758E6c2e',
      '0xc824A08dB624942c5E5F330d56530cD1598859fD',
      '0x11eAA7a46afE1023f47040691071e174125366C8',
      '0x9694ab1b52E51E56390EC5fD3e6f78DaAE97c312',
      '0x4f4f221ff09b01dFD2Ef2206da581262b04B9858',
    ],
  },
  'untangled-yield': {
    celo: ['0x2a68c98bd43aa24331396f29166aef2bfd51343f'],
    polygon: ['0x3f48e00CFEba3e713dB8Bc3E28d634578c553e32'],
    arbitrum: ['0x4a3F7Dd63077cDe8D7eFf3C958EB69A3dD7d31a9'],
  },
  'ggpVault': {
    avax: [
      '0xdF34022e8a280fc79499cA560439Bb6f9797EbD8',
      '0x36213ca1483869c5616be738Bf8da7C9B34Ace8d',
    ],
  },
  'astake': {
    methodology: "Calculates the total amount of ASTR tokens deposited in the ERC4626 vault",
    astar: ['0x0DC6E8922ac0ECa8287ba22Db14C9Ac9317ed18F'],
  },
  'maxapy': {
    doublecounted: true,
    methodology: "Counts total value locked in ERC4626 vaults",
    hallmarks: [
      ['2024-10-23', "Beta Launch"],
      ['2025-04-22', "V1 Launch"],
    ],
    ethereum: ['0x9847c14fca377305c8e2d10a760349c667c367d4'],
    polygon: [
      '0xe7fe898a1ec421f991b807288851241f91c7e376',
      '0xa02aa8774e8c95f5105e33c2f73bdc87ea45bd29',
    ],
    base: [
      '0x7a63e8fc1d0a5e9be52f05817e8c49d9e2d6efae',
      '0xb272e80042634bca5d3466446b0c48ba278a8ae5',
    ],
  },
  'generic-money': {
    methodology: "TVL counts the total assets on Generic Money's vaults which back gUSD and g-units.",
    ethereum: [
      '0x4825eFF24F9B7b76EEAFA2ecc6A1D5dFCb3c1c3f',
      '0xB8280955aE7b5207AF4CDbdCd775135Bd38157fE',
      '0x6133dA4Cd25773Ebd38542a8aCEF8F94cA89892A',
    ],
  },
  'paimon': {
    bsc: ['0x8505c32631034A7cE8800239c08547e0434EdaD9'],
  },
  'altura': {
    hyperliquid: ['0xd0Ee0CF300DFB598270cd7F4D0c6E0D8F6e13f29'],
  },
  'lendle-vault-allocator': {
    doublecounted: true,
    methodology: 'TVL accounts for all assets deposited into the Vaults.',
    mantle: [
      '0xE12EED61E7cC36E4CF3304B8220b433f1fD6e254',
      '0x5A285484126D4e1985AC2cE0E1869D6384027727',
      '0xf36a57369362eB1553f24C8ad50873723E6e1173',
    ],
  },
  'RockSolid': {
    methodology: 'Calls totalAssets() on the RockSolid rock.rETH and rock.loopedETH vaults to get the total amount of rETH and ETH managed by the vaults.',
    start: 1756339201,
    ethereum: [
      '0x936facdf10c8c36294e7b9d28345255539d81bc7',
      '0x7a12D4B719F5aA479eCD60dEfED909fb2A37e428',
    ],
  },
  'avon': {
    methodology: "TVL is the underlying USDm managed by MegaVault, measured via the ERC4626 totalAssets() value.",
    megaeth: ['0x2eA493384F42d7Ea78564F3EF4C86986eAB4a890'],
  },
  'botanix-stBTC': {
    btnx: ['0xF4586028FFdA7Eca636864F80f8a3f2589E33795'],
  },
  'rho-lp-vault': {
    doublecounted: true,
    ethereum: ['0x4cb280e63251b9ab24a54def74bf5995d82ff398'],
  },
  'shinjo': {
    methodology: "TVL is the total assets deposited in Shinjo prize vaults, measured via the ERC4626 totalAssets() function on each vault.",
    base: [
      '0x9d9a8a51d3f1b2465a9f2d2729405a63fd044a09',
      '0x738b1c666C1ae19adE14a8A73562B655746353B0',
      '0x11332d33da296dE34DDa4D0A37ce3303d80f6b61',
      '0x25d99a29463aa85909687985fb58b4406fca7fe3',
    ],
  },
  'neura-vaults': {
    methodology: 'Counts the total value of USD₮0 deposited in Neura Vaults (aiUSDT). Neura Vaults is an AI-powered yield optimization protocol on Hyper EVM that automatically allocates user deposits to the highest-yielding lending protocols including hyperLend, hypurrFinance, felix using intelligent AI agents. TVL is tracked across both the Safe (treasury) and Silo (deployed funds) addresses.',
    hyperliquid: ['0x69C96a82b8534aae25b43644D5964c6b8F215676'],
  },
  'ltv-protocol': {
    methodology: 'Value of ETH deposited in the LTV Protocol vault on Ethereum',
    start: "2025-11-12",
    ethereum: ['0xa260b049ddD6567E739139404C7554435c456d9E'],
  },
}

module.exports = buildProtocolExports(configs, erc4626ExportFn)
