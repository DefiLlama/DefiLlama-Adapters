const Caver = require("caver-js");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require("../helper/balances");

const sTINDER_ADDRESS = "0x710B009307e7344Cbd455cAdAbc1e4bb1C346a55";

const PUBLIC_RPC_URL = "https://klaytn05.fandom.finance";

const BOND_DATA = {
  NAME: "KDAI_TINDER_LP",
  TOKEN: "0x14E180985BC510628F36a4A129FB57A5Fcb2eE33",
  BOND: "0x68a1C029523D60237d1eAe81777d87E49de4E27F",
  TYPE: "LP",
};

async function getBondMarketPrice(caver, bondData) {
  let marketPrice;
  let contract;

  contract = caver.contract.create([abi.getCurrentPool], bondData.TOKEN);
  const reserves = await contract.methods.getCurrentPool().call();
  marketPrice = new BigNumber(reserves[0])
    .div(reserves[1])
    .div(10 ** 9)
    .toString();

  return marketPrice;
}

async function tvl() {
  const caver = new Caver(PUBLIC_RPC_URL);

  const sTINDER = caver.contract.create(
    [abi.circulatingSupply],
    sTINDER_ADDRESS
  );

  const [sTINDERCirculatingSupply, marketPrice] = await Promise.all([
    sTINDER.methods.circulatingSupply().call(),
    getBondMarketPrice(caver, BOND_DATA),
  ]);
  return toUSDTBalances(
    (sTINDERCirculatingSupply * marketPrice) / Math.pow(10, 9).toFixed(2)
  );
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  klaytn: {
    tvl: tvl,
  },
  methodology: "Counts tokens on the staking for tvl",
};
