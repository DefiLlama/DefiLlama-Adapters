const Caver = require("caver-js");
const BigNumber = require("bignumber.js");
const abis = require("./abis");
const { toUSDTBalances } = require("../helper/balances");

const RPC_URL = "https://public-node-api.klaytnapi.com/v1/cypress";

const BLOOD_TOKEN_ADDR = "0x07709260f6C431bc2CB1480F523F4F7c639a5155";
const FOUNTAIN_ADDR = "0x028c7738353a939E654bBDf5Bd57EbB17755cfa0";
const VAULT_ADDR = "0xD7656b90263f6ceaB35370d37f08fD1aEc19A421";
const KLAY_KUSDT_PAIR_ADDR = "0x473e0A6da8E38C032de7531439F578736925c552";
const WKLAY_ADDR = "0x8dfbb066e2881c85749cce3d9ea5c7f1335b46ae";

const caver = new Caver(RPC_URL);
const BloodToken = new caver.klay.Contract(abis.BloodToken, BLOOD_TOKEN_ADDR);
const Fountain = new caver.klay.Contract(abis.Fountain, FOUNTAIN_ADDR);
const KLAY_KUSDT = new caver.klay.Contract(abis.Pair, KLAY_KUSDT_PAIR_ADDR);

const pool2 = async () => {
  const token0 = await KLAY_KUSDT.methods.token0().call();

  let result = new BigNumber(0);
  let { reserve0, reserve1 } = await KLAY_KUSDT.methods.getReserves().call();
  let klayPrice;

  if (String(token0).toLowerCase() === WKLAY_ADDR) {
    reserve1 = new BigNumber(reserve1).multipliedBy(1e12);
    klayPrice = reserve1.dividedBy(reserve0);
  } else {
    reserve0 = new BigNumber(reserve0).multipliedBy(1e12);
    klayPrice = reserve0.dividedBy(reserve1);
  }

  const bldBalance = (await Fountain.methods.tokenBalance().call()) / 1e18;
  const klayBalanace = (await Fountain.methods.bnbBalance().call()) / 1e18;

  const bldPrice = new BigNumber(klayBalanace)
    .dividedBy(bldBalance)
    .multipliedBy(klayPrice);

  const valutAmount =
    (await BloodToken.methods.balanceOf(VAULT_ADDR).call()) / 1e18;

  result = result.plus(new BigNumber(valutAmount).multipliedBy(bldPrice));
  result = result.plus(new BigNumber(bldBalance).multipliedBy(bldPrice));
  result = result.plus(new BigNumber(klayBalanace).multipliedBy(klayPrice));

  return toUSDTBalances(result);
};

module.exports = {
  klaytn: {
    tvl: () => ({}),
    pool2,
  },
};
