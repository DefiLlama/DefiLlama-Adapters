const sdk = require("@defillama/sdk");
const { sumTokensAndLPsSharedOwners, unwrapUniswapLPs } = require("./helper/unwrapLPs");
const KP3R = "0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44";
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
const YEARN_DEPLOYER = "0x0D5Dc686d0a2ABBfDaFDFb4D0533E886517d4E83";
const MASTERCHEF = "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd";

// v2 gauges
const ibCrvGauges = {
  EUR: "0x19b080FE1ffA0553469D20Ca36219F17Fcf03859",
  AUD: "0x3F1B0278A9ee595635B61817630cC19DE792f506",
  GBP: "0xD6Ac1CB9019137a896343Da59dDE6d097F710538",
  KRW: "0x8461A004b50d321CB22B7d034969cE6803911899",
  JPY: "0x8818a9bb44Fbf33502bE7c15c500d0C783B73067",
  CHF: "0x9c2C8910F113181783c249d8F6Aa41b51Cde0f0c"
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
  IBKRW: "0x95dFDC8161832e4fF7816aC4B6367CE201538253"
};
const userInfo = {
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "name": "userInfo",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "rewardDebt",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
};

const totalBorrows = {
  "constant": true,
  "inputs": [],
  "name": "totalBorrows",
  "outputs": [{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}

async function staking(timestamp, block) {

  const balances = {};
  // Protocol Credit Mining LPs
  await sumTokensAndLPsSharedOwners(
    balances,
    [[KPR_WETH_SUSHI_POOL, true],
      [KPR_LDO_SUSHI_POOL, true],
      [KPR_MM_SUSHI_POOL, true],
      [KPR_AMOR_SUSHI_POOL, true],
      [KP3R, false]],
    [KP3R],
    block
  );

  return balances;

}

async function tvl(timestamp, block) {
  const balances = {};

  const { output: sushiToken } = await sdk.api.abi.call({
    abi: userInfo,
    target: MASTERCHEF,
    params: [58, YEARN_DEPLOYER],
    block
  });

  await unwrapUniswapLPs(balances, [{ token: KPR_WETH_SUSHI_POOL, balance: sushiToken.amount }], block);
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [MIM, false],
      [CVX, false],
      [DAI, false],
      [KP3R, false],
      [SEUR, false],
      [SAUD, false],
      [SGBP, false],
      [SKRW, false],
      [SJPY, false],
      [SCHF, false]
    ].concat([
      [KPR_WETH_SUSHI_POOL, true],
      [USDC_ibAUD_POOL, true],
      [USDC_ibEUR_POOL, true],
      [USDC_ibKRW_POOL, true],
      [USDC_ibJPY_POOl, true],
      [USDC_ibGBP_POOL, true],
      [USDC_ibCHF_POOL, true]
    ], Object.values(ibTokens).map(t => [t, false])),
    [YEARN_DEPLOYER, BOND_TREASURY].concat(Object.values(cTokens), Object.values(ibCrvGauges)),
    block
  );

  return balances;
}

async function borrowed(timestamp, block) {
  const balances = {};

  const cyTokens = Object.values(cTokens)
  const { output: borrowed} = await sdk.api.abi.multiCall({
    block: block,
    calls: cyTokens.map((coin) => ({
      target: coin,
    })),
    abi: totalBorrows,
  })

  const ib = Object.values(ibTokens)
  for(const idx in borrowed) {
    sdk.util.sumSingleBalance(balances, ib[idx], borrowed[idx].output);
  }

  return balances
}

module.exports = {
  ethereum: {
    tvl,
    staking,
    borrowed
  }
};