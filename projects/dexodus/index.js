const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  methodology: 'Counts the tokens in the Dexodus liquidity pool, perp dex contract, referrals contract, top 20 crypto market index fund contract and index fund token holder.',
}

const config = {
  ethereum: {
    owners: [
      '0x349f287e595022fc4E160b5699Ef4C7922b6f8F3' // Dexodus index fund token holder address
    ], tokens: [
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // btc
      '0x0000000000000000000000000000000000000000', // eth
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // eth
      '0x39fBBABf11738317a448031930706cd3e612e1B9', // xrp
      '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', // bnb
      '0x418D75f65a02b3D53B2418FB8E1fe493759c7605', // bnb
      '0xD31a59c85aE9D8edEFeC411D448f90841571b89c', // sol
      '0x4206931337dc273a630d328dA6441786BfaD668f', // doge
      '0x514910771AF9Ca656af840dff83E8264EcF986CA', // link
      '0x85f138bfEE4ef8e540890CFb48F620571d67Eda3', // avax
      '0x582d872A1B094FC48F5DE31D3B73F2D9bE47def1', // ton
      '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d', // om
      '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // uni
      '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // aave
      '0x3c3a81e81dc49A522A592e7622A7E711c06bf354', // mnt
      '0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3', // ondo
      '0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b', // cro
      '0x77E06c9eCCf2E797fd462A92B6D7642EF85b0A44', // tao
      '0x57e114B691Db790C35207b2e685D4A43181e6061' // ena
    ]
  },
  base: {
    owners: [
      '0x1A84d7E27e7f0e93Da74b93095e342b6e8dBd50A', // Dexodus liquidity pool address
      '0x39016479A05626Df9BA4cB80864E1B3b69D694b4', // Dexodus perp dex address
      '0x1692992ee7EE987510Dd32BFCeF2C08C8080d5b2', // Dexodus referrals address
      '0x60d5BCF7079879C2FF54Ae5dd1EfE2c13527c98F', // Dexodus index fund smart contract address
      '0x349f287e595022fc4E160b5699Ef4C7922b6f8F3' // Dexodus index fund token holder address
    ], tokens: [
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // usdc
      '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', // btc
      '0xF1143f3A8D76f1Ca740d29D5671d365F66C44eD1', // btc
      '0x0000000000000000000000000000000000000000', // eth
      '0x4200000000000000000000000000000000000006', // eth
      '0x71b35ECb35104773537f849FBC353F81303A5860', // eth
      '0x2615a94df961278DcbC41Fb0a54fEc5f10a693aE', // xrp
      '0x7fdAa50d7399ac436943028edA6ed9a1BD89509f', // bnb
      '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55', // sol
      '0x1C61629598e4a901136a81BC138E5828dc150d67', // sol
      '0x12E96C2BFEA6E835CF8Dd38a5834fa61Cf723736', // doge
      '0xa3A34A0D9A08CCDDB6Ed422Ac0A28a06731335aA', // ada
      '0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196', // link
      '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4', // sui
      '0x51436F6bD047797DE7D11E9d32685f029aed1069', // ton
      '0x3992B27dA26848C2b19CeA6Fd25ad5568B68AB98', // om
      '0xc3De830EA07524a0761646a6a4e4be0e114a3C83', // uni
      '0x63706e401c06ac8513145b7687A14804d17f814b', // aave
      '0x58538e6A46E07434d7E7375Bc268D3cb839C0133' // ena
    ]
  },
  bsc: {
    owners: [
      '0x349f287e595022fc4E160b5699Ef4C7922b6f8F3' // Dexodus index fund token holder address
    ], tokens: [
      '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', // btc
      '0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA', // eth
      '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // eth
      '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE', // xrp
      '0x0000000000000000000000000000000000000000', // bnb
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // bnb
      '0xfA54fF1a158B5189Ebba6ae130CEd6bbd3aEA76e', // sol
      '0x570A5D26f7765Ecb712C0924E4De545B89fD43dF', // sol
      '0x4206931337dc273a630d328dA6441786BfaD668f', // doge
      '0xbA2aE424d960c26247Dd6c32edC70B295c744C43', // doge
      '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47', // ada
      '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD', // link
      '0x1CE0c2827e2eF14D5C4f29a091d735A204794041', // avax
      '0x76A797A59Ba2C17726896976B7B3747BfD1d220f', // ton
      '0xF78D2e7936F5Fe18308A3B2951A93b6c4a41F5e2', // om
      '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402', // dot
      '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1', // uni
      '0xfb6115445Bff7b52FeB98650C87f44907E58f802', // aave
      '0x58538e6A46E07434d7E7375Bc268D3cb839C0133' // ena
    ]
  },
  cronos: {
    owners: [
      '0x349f287e595022fc4E160b5699Ef4C7922b6f8F3' // Dexodus index fund token holder address
    ], tokens: [
      '0x062E66477Faf219F25D27dCED647BF57C3107d52', // btc
      '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a', // eth
      '0xb9Ce0dd29C91E02d4620F57a66700Fc5e41d6D15', // xrp
      '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f', // bnb
      '0xc9DE0F3e08162312528FF72559db82590b481800', // sol
      '0x1a8E39ae59e5556B56b76fCBA98d22c9ae557396', // doge
      '0x0e517979C2c1c1522ddB0c73905e0D39b3F990c0', // ada
      '0xBc6f24649CCd67eC42342AccdCECCB2eFA27c9d9', // link
      '0x8d58088D4E8Ffe75A8b6357ba5ff17B93B912640', // avax
      '0x81710203A7FC16797aC9899228a87fd622df9706', // sui
      '0x994047FE66406CbD646cd85B990E11D7F5dB8fC7', // dot
      '0x16aD43896f7C47a5d9Ee546c44A22205738B329c', // uni
      '0xE657b115bc45c0786274c824f83e3e02CE809185', // aave
      '0x0000000000000000000000000000000000000000', // cro
      '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23' // cro
    ]
  },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})