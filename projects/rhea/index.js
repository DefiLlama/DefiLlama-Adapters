const Caver = require("caver-js");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const axios = require("axios");
const { toUSDTBalances } = require("../helper/balances");

const sRHEAV1_ADDRESS = "0xdc8925963b94Fdc9fBE80Ac07384D83Ab75C4F70";
const sRHEAV2_ADDRESS = "0xB42A35f45C5D5ef8E29fFa6AA26a16bc4C383257";
const BOND_CALCULATOR = "0xBDcFc3C54904A84F09468f1e6fd53b27121b1332";
const TREASURY_ADDRESS = "0x32F71263CF373d726f4e45286Bbb6935d553E8D0";

const RPC_URL = "https://public-node-api.klaytnapi.com/v1/cypress";

const MINT_DATA_ARRAY = [
  {
    NAME: "KDAI_RHEA_LP",
    TOKEN: "0x0b8ac02bf51e1c3a809f8f773dd44025c31c4467",
    BOND: "0x9F8B880EAecca0A6DC942d3A86543deb577651e1",
    TYPE: "LP",
  },
  {
    NAME: "KDAI",
    TOKEN: "0x5c74070fdea071359b86082bd9f9b3deaafbe32b",
    BOND: "",
    TYPE: "STABLE_TOKEN",
  },
];

const loadTokenPrices = async () => {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2,olympus,magic-internet-money,dai,klay-token,klayswap-protocol&vs_currencies=usd";
  const { data } = await axios.get(url);
  const result = {};
  result["AVAX"] = data["avalanche-2"].usd;
  result["MIM"] = data["dai"].usd;
  result["OHM"] = data["olympus"].usd;
  result["OHM"] = data["olympus"].usd;
  result["KLAY"] = data["klay-token"].usd;
  return result;
};

async function getMintVolume(caver, mintData) {
  let volume = 0;
  const [marketPrice, amount] = await Promise.all([
    getBondMarketPrice(caver, mintData),
    getTreasuryAmount(caver, mintData),
  ]);

  if (mintData.TYPE.includes("LP")) {
    const bondCalculatorContract = caver.contract.create(
      [abi.markdown, abi.valuation],
      BOND_CALCULATOR
    );
    const [markdown, valuation] = await Promise.all([
      bondCalculatorContract.methods.markdown(mintData.TOKEN).call(),
      bondCalculatorContract.methods.valuation(mintData.TOKEN, amount).call(),
    ]);

    volume = markdown * (valuation / Math.pow(10, 9));
    if (mintData.NAME === "KDAI_RHEA_LP") {
      const klayPrice = (await loadTokenPrices()).KLAY;
      volume *= klayPrice;
    }
  } else {
    volume = marketPrice * amount;
  }

  return volume / Math.pow(10, 18);
}

async function getBondMarketPrice(caver, mintData) {
  let marketPrice;
  let contract;
  if (mintData.TYPE.includes("LP")) {
    contract = caver.contract.create([abi.getCurrentPool], mintData.TOKEN);
    const reserves = await contract.methods.getCurrentPool().call();
    marketPrice = new BigNumber(reserves[0])
      .div(reserves[1])
      .div(10 ** 9)
      .toString();
  } else if (mintData.TYPE === "STABLE_TOKEN") {
    marketPrice = "1";
  } else {
    throw "ERR";
  }
  return marketPrice;
}

async function getTreasuryAmount(caver, mintData) {
  const contract = caver.contract.create([erc20.balanceOf], mintData.TOKEN);
  return (treasuryAmount = await contract.methods
    .balanceOf(TREASURY_ADDRESS)
    .call());
}

async function fetchStakedToken() {
  const caver = new Caver(RPC_URL);

  const sRHEA = caver.contract.create([abi.circulatingSupply], sRHEAV2_ADDRESS);

  const [sRHEAcirculatingSupply, marketPrice] = await Promise.all([
    sRHEA.methods.circulatingSupply().call(),
    getBondMarketPrice(
      caver,
      MINT_DATA_ARRAY.find((mintData) => mintData.NAME === "KDAI_RHEA_LP")
    ),
  ]);

  return toUSDTBalances(
    (sRHEAcirculatingSupply * marketPrice) / Math.pow(10, 9).toFixed(2)
  );
}

async function fetchLiquidity() {
  const caver = new Caver(RPC_URL);

  const volumes = await Promise.all(
    MINT_DATA_ARRAY.map((mintData) => getMintVolume(caver, mintData))
  );

  return toUSDTBalances(volumes.reduce((acc, cur) => acc + cur, 0).toFixed(2));
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  klaytn: {
    staking: fetchStakedToken,
    tvl: fetchLiquidity,
  },
  methodology:
    "Counts tokens on the treasury for tvl and staked RHEA for staking",
};
