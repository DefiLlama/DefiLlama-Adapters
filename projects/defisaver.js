const BigNumber = require("bignumber.js");
const defisaverABIs = require("./config/defisaver/abis");
const utils = require("./helper/utils");
const sdk = require('@defillama/sdk')

const usdtAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"

const {
  AaveSubscriptions,
  AaveLoanInfo,
  CompoundSubscriptions,
  CompoundLoanInfo,
  McdSubscriptions,
  MCDSaverProxy,
  AaveSubscriptionsV2,
  AaveLoanInfoV2,
} = defisaverABIs;

function getAddress(defisaverConfig) {
  return defisaverConfig.networks['1'].address
}

function getAbi(defisaverConfig, abiName) {
  return defisaverConfig.abi.find(obj => obj.name === abiName)
}

// Configs
const coins = {
  ETH: 18,
  WETH: 18,
  cETH: 8,
  DAI: 18,
  cDAI: 8,
  iDAI: 18,
  MKR: 18,
  BAT: 18,
  cBAT: 8,
  ZRX: 18,
  KNC: 18,
  cZRX: 8,
  REP: 18,
  REPv2: 18,
  cREP: 8,
  USDC: 6,
  cUSDC: 8,
  WBTC: 8,
  cWBTC: 8,
  DGD: 9,
  USDT: 6,
  cUSDT: 8,
  SAI: 18,
  COMP: 18,
  aETH: 18,
  aDAI: 18,
  aUSDC: 18,
  aSUSD: 18,
  SUSD: 18,
  aTUSD: 18,
  TUSD: 18,
  aUSDT: 18,
  aBUSD: 18,
  BUSD: 18,
  aBAT: 18,
  aKNC: 18,
  aLEND: 18,
  LEND: 18,
  aLINK: 18,
  LINK: 18,
  aMANA: 18,
  MANA: 18,
  aMKR: 18,
  aREP: 18,
  aSNX: 18,
  SNX: 18,
  aWBTC: 18,
  aZRX: 18,
  aENJ: 18,
  ENJ: 18,
  aREN: 18,
  REN: 18,
  CRV: 18,
  YFI: 18,
  aYFI: 18,
  PAXUSD: 18,
  DPI: 18,
  UNI: 18,
  cUNI: 8,
  LRC: 18,
  cCOMP: 8,
  aUNI: 18,
  AAVE: 18,
  aAave: 18,
  BAL: 18,
  GUSD: 2,
  RENBTC: 18,
  MATIC: 18,
};

const keys = [
  {
    ETH: "ethereum",
    WETH: "ethereum",
    cETH: "ethereum",
    DAI: "dai",
    cDAI: "cdai",
    iDAI: "dai",
    MKR: "maker",
    BAT: "basic-attention-token",
    cBAT: "compound-basic-attention-token",
    ZRX: "0x",
    cZRX: "compound-0x",
    KNC: "kyber-network",
    REP: "augur",
    REPv2: "augur",
    cREP: "compound-augur",
    USDC: "usd-coin",
    cUSDC: "compound-usd-coin",
    WBTC: "wrapped-bitcoin",
    cWBTC: "compound-wrapped-btc",
    DGD: "digixdao",
    USDT: "tether",
    cUSDT: "compound-usdt",
    SAI: "sai",
    COMP: "compound-coin",
    aETH: "aave-eth",
    aDAI: "aave-dai",
    aUSDC: "aave-usdc",
    aSUSD: "aave-susd",
    SUSD: "nusd",
    aTUSD: "aave-tusd",
    TUSD: "true-usd",
    aUSDT: "aave-usdt",
    aBUSD: "aave-busd",
    BUSD: "binance-usd",
    aBAT: "aave-bat",
    aKNC: "aave-k",
    aLEND: "aave-lend",
    LEND: "ethlend",
    aLINK: "aave-link",
    LINK: "chainlink",
    aMANA: "aave-mana",
    MANA: "decentraland",
    aMKR: "aave-mkr",
    aREP: "aave-rep",
    aSNX: "aave-snx",
    SNX: "havven",
    aWBTC: "aave-wbtc",
    aZRX: "aave-zrx",
    aENJ: "aave-enj",
    ENJ: "enjincoin",
    aREN: "aave-ren",
    REN: "renbtc",
    CRV: "curve-dao-token",
    YFI: "yearn-finance",
    aYFI: "ayfi",
    PAXUSD: "paxos-standard",
    DPI: "defipulse-index",
    UNI: "uniswap",
    cUNI: "compound-uniswap",
    LRC: "loopring",
    cCOMP: "ccomp",
    aUNI: "uniswap",
    AAVE: "aave",
    aAave: "aave",
    BAL: "balancer",
    GUSD: "gemini-dollar",
    RENBTC: "renbtc",
    WSTETH: "staked-ether",
    MATIC: "matic-network",
  },
];

// Utils
const bytesToString = (hex) =>
  Buffer.from(hex.replace(/^0x/, ""), "hex").toString().replace(/\x00/g, "");

const ilkToAsset = (ilk) =>
  (ilk.substr(0, 2) === "0x" ? bytesToString(ilk) : ilk).replace(/-.*/, "");

const assetAmountInEth = (amount, asset = "ETH") => {
  let decimals;
  if (asset.substr(0, 4) === "MCD-") decimals = 18;
  else if (asset === "USD") decimals = 18;
  else decimals = coins[asset];
  return new BigNumber((amount && amount.toString()) || 0)
    .div(10 ** decimals)
    .toString();
};

async function tvl(ts, block) {
  const balances = {}
  const prices = (await utils.getPrices(keys)).data;
  await getCompoundData()
  await getAaveV2Data()
  await getMakerData()
  return balances

  async function getCompoundData() {
    let { output: compoundSubs } = await sdk.api.abi.call({
      target: getAddress(CompoundSubscriptions),
      abi: getAbi(CompoundSubscriptions, 'getSubscribers'),
      block,
    })
    let { output: subData } = await sdk.api.abi.call({
      target: getAddress(CompoundLoanInfo),
      abi: getAbi(CompoundLoanInfo, 'getLoanDataArr'),
      params: [compoundSubs.map((s) => s.user)],
      block,
    })
    const activeSubs = subData.map((sub) => {
      let sumBorrowUsd = 0;
      let sumCollUsd = 0;

      sub.borrowAmounts.forEach((amount, i) => {
        if (sub.borrowAddr[i] === "0x0000000000000000000000000000000000000000")
          return;
        const borrowUsd = assetAmountInEth(amount);
        sumBorrowUsd += parseFloat(borrowUsd);
      });

      sub.collAmounts.forEach((amount, i) => {
        if (sub.collAddr[i] === "0x0000000000000000000000000000000000000000")
          return;
        const collUsd = assetAmountInEth(amount);
        sumCollUsd += parseFloat(collUsd);
      });

      return { sumBorrowUsd, sumCollUsd };
    }).filter(({ sumBorrowUsd }) => sumBorrowUsd);

    activeSubs.forEach(sub => addToBalances(sub.sumCollUsd))
  }

  async function getAaveV2Data() {
    const defaultMarket = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
    let { output: aaveSubs } = await sdk.api.abi.call({
      target: getAddress(AaveSubscriptionsV2),
      abi: getAbi(AaveSubscriptionsV2, 'getSubscribers'),
      block,
    })
    let subData = [];

    for (let i = 0; i < subData.length; i += 30) {
      let userAddresses = aaveSubs.map((s) => s.user).slice(i, i + 30)
      subData = subData.concat(
        (await sdk.api.abi.call({
          target: getAddress(AaveLoanInfoV2),
          abi: getAbi(AaveLoanInfoV2, 'getLoanDataArr'),
          params: [defaultMarket, userAddresses],
          block,
        })
        ).output
      )
    }

    const activeSubs = subData.map((sub) => {
      let sumBorrowUsd = 0;
      let sumCollUsd = 0;

      sub.borrowStableAmounts.forEach((amount, i) => {
        if (sub.borrowAddr[i] === "0x0000000000000000000000000000000000000000")
          return;
        const borrowUsd = assetAmountInEth(amount) * prices.ethereum.usd;
        sumBorrowUsd += borrowUsd;
      });

      sub.borrowVariableAmounts.forEach((amount, i) => {
        if (sub.borrowAddr[i] === "0x0000000000000000000000000000000000000000")
          return;
        const borrowUsd = assetAmountInEth(amount) * prices.ethereum.usd;
        sumBorrowUsd += borrowUsd;
      });

      sub.collAmounts.forEach((amount, i) => {
        if (sub.collAddr[i] === "0x0000000000000000000000000000000000000000")
          return;
        const collUsd = assetAmountInEth(amount) * prices.ethereum.usd;
        sumCollUsd += collUsd;
      });

      return { sumBorrowUsd, sumCollUsd };
    }).filter(({ sumBorrowUsd }) => sumBorrowUsd);

    activeSubs.forEach(sub => addToBalances(sub.sumCollUsd))
  }

  async function getMakerData() {
    let { output: makerSubs } = await sdk.api.abi.call({
      target: getAddress(McdSubscriptions),
      abi: getAbi(McdSubscriptions, 'getSubscribers'),
      block,
    })

    const getCdpDetailedInfoABI = getAbi(MCDSaverProxy, 'getCdpDetailedInfo')

    const calls = [];
    for (const cdp of makerSubs) {
      calls.push({
        target: getAddress(MCDSaverProxy),
        params: [cdp.cdpId,],
      });
    }
    const { output: callResults } = await sdk.api.abi.multiCall({
      abi: getCdpDetailedInfoABI,
      calls,
      block,
    })
    const results = {}
    callResults.forEach(result => results[result.input.params[0]] = result.output)

    let data = [];

    makerSubs.forEach((cdp, i) => {
      const asset = ilkToAsset(results[cdp.cdpId].ilk)
      const debt = assetAmountInEth(results[cdp.cdpId].debt, 'DAI')
      const collateral = assetAmountInEth(results[cdp.cdpId].collateral, `MCD-${asset}`)
      data.push({ debt, collateralUsd: parseFloat(collateral) * parseFloat(prices[keys[0][asset]].usd), })
    });
    const activeSubs = data.filter(({ debt }) => parseFloat(debt));
    activeSubs.forEach(sub => addToBalances(sub.collateralUsd))
  }

  function addToBalances(usdValue) {
    sdk.util.sumSingleBalance(balances, usdtAddress, parseFloat(usdValue) * (10 ** 6))
  }
}

module.exports = {
  ethereum: {
    tvl
  },
};
