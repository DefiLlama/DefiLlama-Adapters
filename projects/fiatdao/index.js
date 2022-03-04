const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const fdt = "0xed1480d12be41d92f36f5f7bdd88212e381a3677";
const comitium = "0x4645d1cF3f4cE59b06008642E74E60e8F80c8b58";

const stakingNft = "0xE9F9936a639809e766685a436511eac3Fb1C85bC";
const fdtGohm = "0x75b02b9889536B617d57D08c1Ccb929c523945C1";

const stakingContract = "0xe98ae8cD25CDC06562c29231Db339d17D02Fd486";
const wSOhm = "0xca76543cf381ebbb277be79574059e32108e3e65";
const rgt = "0xD291E7a03283640FDc51b121aC401383A46cC623";
const yfi = "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e";
const mkr = "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2";
const bond = "0x0391D2021f89DC339F60Fff84546EA23E337750f";
const uma = "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828";
const wsohmFdtSLP = "0x2e30e758b3950dd9afed2e21f5ab82156fbdbbba";

const gOhm = "0x0ab87046fbb341d058f17cbc4c1133f25a20a52f";

async function tvl(timestamp, block) {
  let balances = {};
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [wSOhm, false],
      [rgt, false],
      [yfi, false],
      [mkr, false],
      [bond, false],
      [uma, false],
      [wsohmFdtSLP, true],
      [fdtGohm, true],
    ],
    [stakingContract, stakingNft],
    block,
    "ethereum",
    (addr) => {
      if (addr.toLowerCase() === "0xca76543cf381ebbb277be79574059e32108e3e65") {
        return gOhm;
      }
      return addr;
    }
  );
  return balances;
}

module.exports = {
  methodology:
    "TVL includes value of Rewards Pools and staking includes FDT staked in Senatus",
  ethereum: {
    tvl,
    staking: staking(comitium, fdt),
  },
};
