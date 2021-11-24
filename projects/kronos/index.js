const Caver = require("caver-js");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");

const sKRNO_ADDRESS = "0x6555F93f608980526B5cA79b3bE2d4EdadB5C562";
const BOND_CALCULATOR = "0x58e3CAd0fD5AF0bBaA012fb3E2D0EF17fe1B0c3E";

const TREASURY_ADDRESS = "0x03c812eE50e244909efE72e8c729976ACc5C16bb";

const KRNOS_RPC_URL = "https://en.kronosdao.finance";

const MINT_DATA_ARRAY = [
  {
    NAME: "KDAI",
    TOKEN: "0x5c74070fdea071359b86082bd9f9b3deaafbe32b",
    BOND: "0x017EA59Bf82C26288CE8211d3A35B25BBa684eD8",
    TYPE: "STABLE_TOKEN",
  },
  {
    NAME: "KDAI_KRNO_LP",
    TOKEN: "0xdf5caf79899407da1c1b31389448861a9846956d",
    BOND: "0x9bA4428d3B753880dF53F67ABb31222EF900DB79",
    TYPE: "LP",
  },
  {
    NAME: "KSD",
    TOKEN: "0x4fa62f1f404188ce860c8f0041d6ac3765a72e67",
    BOND: "0x1FF29982e7eC4F53728ED398063587876F2a0d22",
    TYPE: "STABLE_TOKEN",
  },
  {
    NAME: "KSD_KRNO_LP",
    TOKEN: "0x5876aa130de74d9d8924e8ff05a0bc4387ee93f0",
    BOND: "0xb805CD015D52e852fC31B8937b80adBc00Cc2B61",
    TYPE: "LP",
  },
];

async function getMintVolume(caver, mintData) {
  let volume = 0;
  const [marketPrice, amount] = await Promise.all([
    getBondMarketPrice(caver, mintData),
    getTreasuryAmount(caver, mintData),
  ]);

  if (mintData.TYPE === "LP") {
    const bondCalculatorContract = caver.contract.create(
      [abi.markdown, abi.valuation],
      BOND_CALCULATOR
    );
    const markdown = await bondCalculatorContract.methods
      .markdown(mintData.TOKEN)
      .call();

    const valuation = await bondCalculatorContract.methods
      .valuation(mintData.TOKEN, amount)
      .call();

    volume = (markdown / Math.pow(10, 18)) * (valuation / Math.pow(10, 9));
  } else {
    volume = (marketPrice * amount) / Math.pow(10, 18);
  }

  return volume;
}

async function getBondMarketPrice(caver, mintData) {
  let marketPrice;
  let contract;
  if (mintData.TYPE === "LP") {
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
  const caver = new Caver(KRNOS_RPC_URL);

  const sKRNO = caver.contract.create([abi.circulatingSupply], sKRNO_ADDRESS);

  const [sKRNOcirculatingSupply, marketPrice] = await Promise.all([
    sKRNO.methods.circulatingSupply().call(),
    getBondMarketPrice(
      caver,
      MINT_DATA_ARRAY.find((mintData) => mintData.NAME === "KDAI_KRNO_LP")
    ),
  ]);
  return (sKRNOcirculatingSupply * marketPrice) / Math.pow(10, 9).toFixed(2);
}

async function fetchLiquidity() {
  const caver = new Caver(KRNOS_RPC_URL);

  const volumes = await Promise.all(
    MINT_DATA_ARRAY.map((mintData) => getMintVolume(caver, mintData))
  );

  return volumes.reduce((acc, cur) => acc + cur, 0).toFixed(2);
}

module.exports = {
  fetch: fetchLiquidity,
  staking: {
    fetch: fetchStakedToken,
  },
  methodology:
    "Counts tokens on the treasury for tvl and staked KRNO for staking",
};
