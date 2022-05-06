// @ts-check
/**
 * @typedef {{ [address: string]: string }} Balances
 * @typedef {{ [address: string]: { price: string } }} TokenPrices
 * @typedef {{ [address: string]: { price: string, balance: string } }} TokenData
 */
 const BigNumber = require("bignumber.js");
 const web3 = require("./config/web3.js");
 const abis = require("./config/abis.js").abis;
 
 const sdk = require("@defillama/sdk");
 const {
   sumTokensAndLPsSharedOwners,
   unwrapUniswapLPs,
 } = require("./helper/unwrapLPs");
 const utils = require("./helper/utils");
 
 const KP3R = "0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44";
 const KP3RV2 = "0xeb02addCfD8B773A5FFA6B9d1FE99c566f8c44CC"
 const KPR_LDO_SUSHI_POOL = "0x79e0d4858af8071349469b6589a3c23c1fe1586e";
 const KPR_WETH_SUSHI_POOL = "0xaf988aff99d3d0cb870812c325c588d8d8cb7de8";
 const KPR_MM_SUSHI_POOL = "0x18ee956e99cc606530c20d9cadd6af5ece08d89f";
 const KPR_AMOR_SUSHI_POOL = "0x9c2efb900290402fd2b891170085b9d651bfc5ce";
 const USDC_ibAUD_POOL = "0x71852e888a601c9bbb6f48172a9bfbd8010aa810";
 const USDC_ibEUR_POOL = "0x5271d250bf9528981846a9dd94a97cbbe7318817";
 const USDC_ibKRW_POOL = "0xa42f219d4394216d851d75dcb6b742595146379c";
 const USDC_ibJPY_POOl = "0xeaebf8736ec441eecec31533ebd3a21d61caa252";
 const USDC_ibGBP_POOL = "0x8704850232ab7f3490f64b14fd8c8b3e6e411914";
 const USDC_ibCHF_POOL = "0x1f2bcc260483443a9dd686307bb2809a78400a4f";
 const BOND_TREASURY = "0xc43b3b33b21dfcef48d8f35e6671c4f4be4ef8a2";
 const SEUR = "0xd71ecff9342a5ced620049e616c5035f1db98620";
 const SAUD = "0xF48e200EAF9906362BB1442fca31e0835773b8B4";
 const SGBP = "0x97fe22E7341a0Cd8Db6F6C021A24Dc8f4DAD855F";
 const SKRW = "0x269895a3dF4D73b077Fc823dD6dA1B95f72Aaf9B";
 const SJPY = "0xF6b1C627e95BFc3c1b4c9B825a032Ff0fBf3e07d";
 const SCHF = "0x0F83287FF768D1c1e17a42F44d644D7F22e8ee1d";
 const MIM = "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3";
 const CVX = "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b";
 const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
 const SUSHI = "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2"
 const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52"
 const CVXCRV = "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7"
 const SPELL = "0x090185f2135308BaD17527004364eBcC2D37e5F6"
 const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
 const YEARN_DEPLOYER = "0x0D5Dc686d0a2ABBfDaFDFb4D0533E886517d4E83";
 const MASTERCHEF = "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd";
 
 const Kp3rV2Klps = {
   KP3R_WETH_1_PERCENT: "0x3f6740b5898c5D3650ec6eAce9a649Ac791e44D7",
 }
 
 const Kp3rV1Slps = {
   SUSHI_KP3R_ETH: "0xaf988afF99d3d0cb870812C325C588D8D8CB7De8",
   SUSHI_KP3R_LDO: "0x79e0D4858AF8071349469B6589a3c23C1fE1586E",
   SUSHI_ARMOR_KP3R: "0x9C2Efb900290402fd2b891170085B9d651bfC5Ce",
   SUSHI_KP3R_MM: "0x18EE956E99cC606530C20d9CAdD6AF5EcE08d89F",
   SUSHI_KP3R_HEGIC: "0x19bF7b6821473BeA075F207D6269209c856896F6",
 }
 
 // v2 gauges
 const ibCrvGauges = {
   EUR: "0x19b080FE1ffA0553469D20Ca36219F17Fcf03859",
   AUD: "0x3F1B0278A9ee595635B61817630cC19DE792f506",
   GBP: "0xD6Ac1CB9019137a896343Da59dDE6d097F710538",
   KRW: "0x8461A004b50d321CB22B7d034969cE6803911899",
   JPY: "0x8818a9bb44Fbf33502bE7c15c500d0C783B73067",
   CHF: "0x9c2C8910F113181783c249d8F6Aa41b51Cde0f0c",
 };
 
 // Iron Bank Collateral
 const cTokens = {
   CYEUR: "0x00e5c0774a5f065c285068170b20393925c84bf3",
   CYJPY: "0x215F34af6557A6598DbdA9aa11cc556F5AE264B1",
   CYGBP: "0xecaB2C76f1A8359A06fAB5fA0CEea51280A97eCF",
   CYCHF: "0x1b3E95E8ECF7A7caB6c4De1b344F94865aBD12d5",
   CYAUD: "0x86BBD9ac8B9B44C95FFc6BAAe58E25033B7548AA",
   CYKRW: "0x3c9f5385c288cE438Ed55620938A4B967c080101",
 };
 const ibTokens = {
   IBEUR: "0x96e61422b6a9ba0e068b6c5add4ffabc6a4aae27",
   IBJPY: "0x5555f75e3d5278082200Fb451D1b6bA946D8e13b",
   IBGBP: "0x69681f8fde45345C3870BCD5eaf4A05a60E7D227",
   IBCHF: "0x1CC481cE2BD2EC7Bf67d1Be64d4878b16078F309",
   IBAUD: "0xFAFdF0C4c1CB09d430Bf88c75D88BB46DAe09967",
   IBKRW: "0x95dFDC8161832e4fF7816aC4B6367CE201538253",
 };
 const userInfo = {
   inputs: [
     {
       internalType: "uint256",
       name: "",
       type: "uint256",
     },
     {
       internalType: "address",
       name: "",
       type: "address",
     },
   ],
   name: "userInfo",
   outputs: [
     {
       internalType: "uint256",
       name: "amount",
       type: "uint256",
     },
     {
       internalType: "uint256",
       name: "rewardDebt",
       type: "uint256",
     },
   ],
   stateMutability: "view",
   type: "function",
 };
 
 const totalBorrows = {
   constant: true,
   inputs: [],
   name: "totalBorrows",
   outputs: [
     {
       internalType: "uint256",
       name: "",
       type: "uint256",
     },
   ],
   payable: false,
   stateMutability: "view",
   type: "function",
 };
 
 const priceRegistry = [
   {
     constant: true,
     inputs: [{ name: "_forex", type: "address" }],
     name: "price",
     outputs: [{ name: "", type: "uint256" }],
     type: "function",
   },
 ];
 
 // async function staking(timestamp, block) {
 //   const balances = {};
 //   // Protocol Credit Mining LPs
 //   await sumTokensAndLPsSharedOwners(
 //     balances,
 //     [
 //       [KPR_WETH_SUSHI_POOL, true],
 //       [KPR_LDO_SUSHI_POOL, true],
 //       [KPR_MM_SUSHI_POOL, true],
 //       [KPR_AMOR_SUSHI_POOL, true],
 //       [KP3R, false],
 //     ],
 //     [KP3R],
 //     block
 //   );
 
 //   console.log('===================  staking ======================')
 //   console.log({balances})
 
 //   return balances;
 // }
 
 async function tvl(timestamp, block) {
   const balances = {};
 
   // const { output: sushiToken } = await sdk.api.abi.call({
   //   abi: userInfo,
   //   target: MASTERCHEF,
   //   params: [58, YEARN_DEPLOYER],
   //   block,
   // });
 
   // await unwrapUniswapLPs(
   //   balances,
   //   [{ token: KPR_WETH_SUSHI_POOL, balance: sushiToken.amount }],
   //   block
   // );
 
   /** @todo: KP3R SUSHI NOT RETURNING RIGHT BALANCES I THINK */
   await sumTokensAndLPsSharedOwners(
     balances,
     [
       // [MIM, false],
       [CVX, false],
       [DAI, false],
       [KP3R, false],
       [SUSHI, false],
       [CRV, false],
       [CVXCRV, false],
       [SPELL, false],
       [WETH, false],
       // [SEUR, false],
       // [SAUD, false],
       // [SGBP, false],
       // [SKRW, false],
       // [SJPY, false],
       // [SCHF, false],
     ].concat(
       [
         [KPR_WETH_SUSHI_POOL, true],
         [USDC_ibAUD_POOL, true],
         [USDC_ibEUR_POOL, true],
         [USDC_ibKRW_POOL, true],
         [USDC_ibJPY_POOl, true],
         [USDC_ibGBP_POOL, true],
         [USDC_ibCHF_POOL, true],
       ],
       Object.values(ibTokens).map((t) => [t, false])
     ),
     [YEARN_DEPLOYER, BOND_TREASURY].concat(
       Object.values(cTokens),
       Object.values(ibCrvGauges)
     ),
     block
   );
 
   await sumTokensAndLPsSharedOwners(balances, Object.values(Kp3rV1Slps).map((t) => [t, true]), [KP3R])
 
   console.log(balances[KP3R.toLowerCase()])
   console.log({balances})
   return balances;
 }
 
 // async function borrowed(timestamp, block) {
 //   const balances = {};
 
 //   const cyTokens = Object.values(cTokens);
 //   const { output: borrowed } = await sdk.api.abi.multiCall({
 //     block: block,
 //     calls: cyTokens.map((coin) => ({
 //       target: coin,
 //     })),
 //     abi: totalBorrows,
 //   });
 
 // const ib = Object.values(ibTokens);
 // for (const idx in borrowed) {
 //   sdk.util.sumSingleBalance(balances, ib[idx], borrowed[idx].output);
 // }
 
 //   console.log('=================== borroweds ======================')
 //   console.log({balances})
 
 //   return balances;
 // }
 
 const ffRegistryAddress = "0x5C08bC10F45468F18CbDC65454Cbd1dd2cB1Ac65";
 
 
 // const IB_TOKENS = [
 //   '0xFAFdF0C4c1CB09d430Bf88c75D88BB46DAe09967', // ibAUD
 //   '0x1CC481cE2BD2EC7Bf67d1Be64d4878b16078F309', // ibCHF
 //   '0x69681f8fde45345C3870BCD5eaf4A05a60E7D227', // ibGBP
 //   '0x5555f75e3d5278082200Fb451D1b6bA946D8e13b', // ibJPY
 //   '0x96E61422b6A9bA0e068B6c5ADd4fFaBC6a4aae27', // ibEUR
 //   '0x95dFDC8161832e4fF7816aC4B6367CE201538253', // ibKRW
 // ];
 
 /**
  * @param {{ block }} options
  * @returns {Promise<TokenPrices>} prices
  */
 const getIbTokenPrices = async ({ block }) => {
   const ibTokensAddresses = Object.values(ibTokens);
   const { output } = await sdk.api.abi.multiCall({
     block: block,
     calls: ibTokensAddresses.map((address) => ({
       target: ffRegistryAddress,
       params: address,
     })),
     abi: priceRegistry[0],
   });
 
   return output.reduce((acc, curr) => {
     const address = curr.input.params[0].toLowerCase();
 
     acc[address] = {
       price: curr.output,
     };
 
     return acc;
   }, {});
 }
 
 /**
  * @param {{ balances: Balances, block: any }} options
  * @return {Promise<BigInt>} ibTokensTVL
  */
 const getIbTokensTVL = async ({ balances, block }) => {
   const ibTokenPrices = await getIbTokenPrices({ block });
 
   const ibTokenAddresses = Object.keys(ibTokenPrices).map((a) => a.toLowerCase());
 
   const ibTokensData = ibTokenAddresses.reduce((acc, addr) => {
     acc[addr].balance = balances[addr];
     return acc;
   }, /** @type {TokenData} */ (ibTokenPrices));
 
   return Object.values(ibTokensData).reduce(
     (acc, { price, balance }) => acc + (BigInt(price) * BigInt(balance)) / BigInt(1e36),
     0n
   );
 }
 
 // /**
 //  * @param {{ balances: Balances }} options
 //  * @return {Promise<BigInt>} kp3rTVL
 //  */
 // const getKp3rTVL = async ({ balances }) => {
 //   const { data } = await utils.getPricesfromString("keep3rv1");
 //   const kp3rPrice = data.keep3rv1.usd;
 //   return (BigInt(Math.round(kp3rPrice * 100)) * BigInt(balances[KP3R.toLowerCase()])) / BigInt(1e18) / 100n;
 // }
 
 /**
  * @param {{ balances: Balances }} options
  * @return {Promise<BigInt>} kp3rTVL
  */
 const getOtherTokensTVL = async ({ balances }) => {
   const addresses = [
     KP3R,
     WETH,
     CVX,
     DAI,
     SUSHI,
     CRV,
     CVXCRV,
     SPELL,
   ];
 
   const { data } = await utils.getPricesFromContract(addresses);
 
   const TVL = addresses.reduce((acc, curr) => {
     const addr = curr.toLowerCase();
     const price = data[addr].usd;
     const balance = balances[addr];
 
     acc += BigInt(Math.round(price * 100)) * BigInt(balance) / BigInt(1e18) / 100n;
     return acc;
   }, 0n);
   
   return TVL;
 }
 
 async function fetch(timestamp, block) {
   const balances = /** @type {Balances} */ (await tvl(timestamp, block));
 
   const IB_TOKENS_TVL = await getIbTokensTVL({ balances, block });
 
   // const KP3R_TVL = await getKp3rTVL({ balances });
 
   const OTHER_TOKENS_TVL = await getOtherTokensTVL({ balances });
 
   console.log({ OTHER_TOKENS_TVL });
 
   // @ts-ignore
   const TVL = IB_TOKENS_TVL + OTHER_TOKENS_TVL;
 
   console.log({ TVL })
 
   return TVL;
 }
 
 module.exports = {
   ethereum: {
     // tvl,
     // staking,
     // borrowed,
   },
   fetch,
 };
 