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

  // 3. LPS
  const LPSTVL = await Promise.all(
    constants.LPS.map(async (LP) => {
      const contract = new web3.eth.Contract(abis[`LP_${LP.type}`], LP.address);
      const [token0, token1] = LP.tokens;
      const t0Price = (await utils.getPricesfromString(token0)).data[token0]
        .usd;
      const t1Price = (await utils.getPricesfromString(token1)).data[token1]
        .usd;
      const {
        _reserve0,
        _reserve1,
      } = await contract.methods.getReserves().call();
      const t0TVL = new BN(_reserve0).div(10 ** 18).times(t0Price);
      const t1TVL = new BN(_reserve1).div(10 ** 18).times(t1Price);
      return t0TVL.plus(t1TVL);
    })
  );
  const totalLPTVL = LPSTVL.reduce((acc, curr) => acc.plus(curr), new BN(0));

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
