const Web3 = require("web3");
const BN = require("bignumber.js");
const utils = require("./helper/utils");
const { abis } = require("./config/yaxis/abis.js");
const constants = require("./config/yaxis/constants.js");

const env = require("dotenv").config();
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`
  )
);

async function fetch() {
  // 1. MetaVault
  const metaVault = new web3.eth.Contract(
    abis.yAxisMetaVault,
    constants.METAVAULT
  );
  const threeCrv = await metaVault.methods.balance().call();
  const threeCrvPrice = (await utils.getPricesfromString("lp-3pool-curve"))
    .data["lp-3pool-curve"].usd;
  const metaVaultTVL = new BN(threeCrv).div(10 ** 18).times(threeCrvPrice);

  // 2. sYAX
  const chef = new web3.eth.Contract(abis.yAxisBar, constants.BAR);
  const sYAX = await chef.methods.availableBalance().call();
  const yaxisPrice = (await utils.getPricesfromString("yaxis")).data["yaxis"]
    .usd;
  const sYaxTVL = new BN(sYAX).div(10 ** 18).times(yaxisPrice);


  const totalLPTVL = 0;

  // 4. VAULTS
  // vault balance
  // plus
  // amount staked in YaxisChef

  const totalTVL = metaVaultTVL.plus(sYaxTVL).plus(totalLPTVL).toFixed(2);
  return totalTVL;
}

module.exports = {
  fetch,
};
