const Caver = require("caver-js");
const BigNumber = require("bignumber.js");
const abis = require("./abis");
const { toUSDTBalances } = require("../helper/balances");

const RPC_URL = "https://public-node-api.klaytnapi.com/v1/cypress";

const BLOOD_TOKEN_ADDR = "0x07709260f6C431bc2CB1480F523F4F7c639a5155";
const PRICE_CALCULATOR_ADDR = "0xf890b924EF71493a7E6280a8602d913199d71827";
const FOUNTAIN_ADDR = "0x028c7738353a939E654bBDf5Bd57EbB17755cfa0";
const VAULT_ADDR = "0xD7656b90263f6ceaB35370d37f08fD1aEc19A421";

const caver = new Caver(RPC_URL);
const BloodToken = new caver.klay.Contract(abis.BloodToken, BLOOD_TOKEN_ADDR);
const Fountain = new caver.klay.Contract(abis.Fountain, FOUNTAIN_ADDR);
const PriceCalc = new caver.klay.Contract(
  abis.PriceCalculator,
  PRICE_CALCULATOR_ADDR
);

const tvl = async () => {
  let result = new BigNumber(0);

  const bldPrice = (await PriceCalc.methods.priceOfBLD().call()) / 1e18;
  const klayPrice = (await PriceCalc.methods.priceOfKLAY().call()) / 1e18;

  const valutAmount =
    (await BloodToken.methods.balanceOf(VAULT_ADDR).call()) / 1e18;
  result = result.plus(new BigNumber(valutAmount).multipliedBy(bldPrice));

  const bldBalance = (await Fountain.methods.tokenBalance().call()) / 1e18;
  result = result.plus(new BigNumber(bldPrice).multipliedBy(bldBalance));

  const klayBalanace = (await Fountain.methods.bnbBalance().call()) / 1e18;
  result = result.plus(new BigNumber(klayPrice).multipliedBy(klayBalanace));

  return toUSDTBalances(result.toString());
};

module.exports = {
  klaytn: {
    tvl,
  },
};
