const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { covalentGetTokens } = require("../helper/http");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking.js");

/* Note: there are LON staked tokens within the protocol, accounting for aprox $30M at current market price
 *  but the protocol itself are minting them...
 */
const LON_TOKEN = "0x0000000000095413afc295d19edeb1ad7b71c952";
const CONTRACT_FOR_STAKING = "0xf88506B0F1d30056B9e5580668D5875b9cd30F23";

// Used for grabbing AMM wrapper & PMM
const PERMANENT_STORAGE_PROXY = "0x6D9Cc14a1d36E6fF13fc6efA9e9326FcD12E7903";

const STAGES_STAKING_CONTRACTS = [
  //FIRST_STAGE
  ["0x7924a818013f39cf800f5589ff1f1f0def54f31f", "0x929CF614C917944dD278BC2134714EaA4121BC6A",], 
  //SECOND_STAGE_LON_ETH
  ["0x7924a818013f39cf800f5589ff1f1f0def54f31f", "0xc348314f74b043ff79396e14116b6f19122d69f4",], 
  //SECOND_STAGE_LON_USDT
  ["0x55d31f68975e446a40a2d02ffa4b0e1bfb233c2f", "0x11520d501e10e2e02a2715c4a9d3f8aeb1b72a7a",], 
  //THIRD_STAGE_LON_ETH
  ["0x7924a818013f39cf800f5589ff1f1f0def54f31f", "0x74379CEC6a2c9Fde0537e9D9346222a724A278e4",], 
  //THIRD_STAGE_LON_USDT
  ["0x55d31f68975e446a40a2d02ffa4b0e1bfb233c2f", "0x539a67b6f9c3cad58f434cc12624b2d520bc03f8"], 
];

// Receives rewards/fee from AMM wrapper via reward distributor on WETH shape, some are sold for LON...
const MULTISIG_ONE = "0x3557BD3d422300198719710Cc3f00194E1c20A46";

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const ethTvl = async (timestamp, block) => {
  const amm_wrapper_addr = (
    await sdk.api.abi.call({
      abi: abi.ammWrapperAddr,
      target: PERMANENT_STORAGE_PROXY,
      block,
    })
  ).output;


  const pmm_addr = (
    await sdk.api.abi.call({
      abi: abi.pmmAddr,
      target: PERMANENT_STORAGE_PROXY,
      block,
    })
  ).output;

  const [ tokens_amm, tokens_pmm] = await Promise.all([covalentGetTokens(amm_wrapper_addr), covalentGetTokens(pmm_addr)])
  const toa = []
  tokens_amm.forEach(t => toa.push([t, amm_wrapper_addr]))
  tokens_pmm.forEach(t => toa.push([t, pmm_addr]))

  return sumTokens2({ tokensAndOwners: toa, block, });
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking: staking(CONTRACT_FOR_STAKING, LON_TOKEN),
    pool2: (_, block) => sumTokens2({ tokensAndOwners: STAGES_STAKING_CONTRACTS, block, resolveLP: true }),
    treasury: (_, block) => sumTokens2({ owner: MULTISIG_ONE, tokens: [
      '0xdac17f958d2ee523a2206206994597c13d831ec7',
      '0x55d31f68975e446a40a2d02ffa4b0e1bfb233c2f',
      '0x8E870D67F660D95d5be530380D0eC0bd388289E1', //USDP
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', //USDC
      '0x0000000000085d4780B73119b644AE5ecd22b376', //TUSD
      '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', //UNI
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
      '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // MATIC
      '0x4Fabb145d64652a948d72533023f6E7A623C7C53', // BUSD
      '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', // FEI
      '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
      '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
      '0x4E15361FD6b4BB609Fa63C81A2be19d873717870', // FTM
      '0xdd974D5C2e2928deA5F71b9825b8b646686BD200', // KNC
      '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
      '0xD533a949740bb3306d119CC777fa900bA034cd52', // CRV
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942', // MANA
      '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
      '0xc944E90C64B2c07662A292be6244BDf05Cda44a7', // GRT
      '0xc944E90C64B2c07662A292be6244BDf05Cda44a7', // UMA
      '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', // SUSHI
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      '0xE41d2489571d322189246DaFA5ebDe1F4699F498', // zRX
      '0x408e41876cCCDC0F92210600ef50372656052a38', // ren
      '0xc00e94Cb662C3520282E6f5717214004A7f26888', // COMP
      '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07', // OMG
      '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919', // RAI
      '0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD', // LRC

    ], block, }),
  },
  
};
