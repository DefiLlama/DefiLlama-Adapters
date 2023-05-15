const { nullAddress, treasuryExports, } = require("../helper/treasury");
const sdk = require('@defillama/sdk')

const TIME = "0xb54f16fb19478766a268f172c9480f8da1a7c9c3"
// Sources: https://wl-l.ink/Zapper/Treasury and https://docs.wonderland.money/ecosystem/contracts
const treasuries = [
  "0x1c46450211cb2646cc1da3c5242422967ed9e04c", "0x355d72fb52ad4591b2066e43e89a7a38cf5cb341", "0xb6b80f4ea8fb4117928d3c819e8ac6f1a3837baf",
  "0x88bbe6de858b179841c8f49a56b99fb0522a263a", "0x32b5d1f1331f857d583b05ef50ab9636cdc090d9", "0x1de8a4c781ac134c1a7640aabe5929f4e1fe2f5b",
  "0x694497072b2c43b737ae70bbd52694d61377344c", "0x004016b53f127c8f6f64cbf66330765dcf5dbe2a", "0xb96e3bf7d8939e9e17adcc26fdf47b6c7391eb6a",
  "0xba90fabdde85191ae04bfdd8022f6d7b1f86c2f4", "0x5a4a936e90caf09590ac402b6e8d5435a5092a7a", "0x1724b987feb9651c466d9e66be4b74a7cedbf372"
]

const ethWallet = '0x355d72fb52ad4591b2066e43e89a7a38cf5cb341'

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
      '0x55c08ca52497e2f1534b59e2917bf524d4765257', // uwu
      '0xFEEf77d3f69374f66429C91d732A244f074bdf74', // cvxFXS
      '0x3E04863DBa602713Bb5d0edbf7DB7C3A9A2B6027', // SLP
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
      '0x028171bCA77440897B824Ca71D1c56caC55b68A3',//aDAI
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
      '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
      '0xFcF8eda095e37A41e002E266DaAD7efC1579bc0A',//flex
      '0xdB25f211AB05b1c97D595516F45794528a807ad8',//eurs
      '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',//stg
      '0x29127fe04ffa4c32acac0ffe17280abd74eac313',//sifu
      '0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d',//LQTY
      '0x51144708b82eA3b5b1002C9DC38b71ec63b7e670',// uwu lend token
      '0xdb1a8f07f6964efcfff1aa8025b8ce192ba59eba',// uwu lend token
      '0x8c240c385305aeb2d5ceb60425aabcb3488fa93d',// uwu lend token
      '0xc480a11a524e4db27c6d4e814b4d9b3646bc12fc',// uwu lend token
      '0x8028ea7da2ea9bcb9288c1f6f603169b8aea90a6',// uwu lend token
      '0x243387a7036bfcb09f9bf4eced1e60765d31aa70',// uwu lend token
      '0xadfa5fa0c51d11b54c8a0b6a15f47987bd500086',// uwu lend token
      '0x02738ef3f8d8d3161dbbedbda25574154c560dae',// uwu lend token
      '0x6ace5c946a3abd8241f31f182c479e67a4d8fc8d',// uwu lend token
      '0x67fadbd9bf8899d7c578db22d7af5e2e500e13e5',// uwu lend token
    ],
    owners: [ethWallet],
    ownTokens: ['0x3b79a28264fc52c7b4cea90558aa0b162f7faf57'],
  },
  avax: {
    tokens: [
      nullAddress,
      "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",//usdte
      "0x39fC9e94Caeacb435842FADeDeCB783589F50f5f",//knc
      "0x63682bdc5f875e9bf69e201550658492c9763f89",//bsgg
      "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",//USDC
      "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",//USDC.e
      "0x9e295b5b976a184b14ad8cd72413ad846c299660",//fsGLP
    ],
    owners: treasuries,
    ownTokens: [TIME, '0x0da67235dd5787d67955420c84ca1cecd4e5bb3b'],
  },
  arbitrum: {
    tokens: [
      nullAddress,
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",//weth
      "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",//gmx
      "0xd2D1162512F927a7e282Ef43a362659E4F2a728F",//sbfGMX
    ],
    owners: treasuries
  },
  polygon: {
    tokens: [
      nullAddress,
      // "0xb08b3603C5F2629eF83510E6049eDEeFdc3A2D91",//cpool
    ],
    owners: treasuries
  },
  bsc: {
    tokens: [
      nullAddress,
      "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",//USDC
    ],
    owners: treasuries
  },
  fantom: {
    tokens: [
      nullAddress,
    ],
    owners: treasuries
  },
  optimism: {
    tokens: [
      nullAddress,
      "0xdfa46478f9e5ea86d57387849598dbfb2e964b02",//MAI
      "0x4200000000000000000000000000000000000006",//WETH
      "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",//USDT
    ],
    owners: treasuries
  }
})

module.exports.ethereum.tvl = sdk.util.sumChainTvls([module.exports.ethereum.tvl, uwuPositions])
async function uwuPositions(_, _b, _cb, { api, }) {
  // 
  //  LUSD in stability pool
  const {initialValue : LUSDBal} = await api.call({ abi: "function deposits(address) view returns (uint256 initialValue, address frontEndTag)", target: '0x66017D22b0f8556afDd19FC67041899Eb65a21bb', params: ethWallet })
  const uwuLPLocked= await api.call({ abi:"function lockedBalances(address user) view returns (uint256 total, uint256 unlockable, uint256 locked, tuple(uint256 amount, uint256 unlockTime)[] lockData)", target: '0x0a7b2a21027f92243c5e5e777aa30bb7969b0188', params: ethWallet })
  const [uDAI, vdDAI, uUSDT, vdUSDT] = await api.multiCall({
    abi: 'erc20:balanceOf', calls: [
      { target: '0xb95bd0793bcc5524af358ffaae3e38c3903c7626', params: ethWallet },
      { target: '0x1254b1fd988a1168e44a4588bb503a867f8e410f', params: ethWallet },
      { target: '0x24959f75d7bda1884f1ec9861f644821ce233c7d', params: ethWallet },
      { target: '0xaac1d67f1c17ec01593d76e831c51a4f458dc160', params: ethWallet },
    ]
  })
  api.add('0x5f98805A4E8be255a32880FDeC7F6728C6568bA0', LUSDBal)
  api.add('0x3E04863DBa602713Bb5d0edbf7DB7C3A9A2B6027', uwuLPLocked.total)
  api.add('0xb95bd0793bcc5524af358ffaae3e38c3903c7626', +uDAI - vdDAI)
  api.add('0x24959f75d7bda1884f1ec9861f644821ce233c7d', +uUSDT - vdUSDT)
  return api.getBalances()
}