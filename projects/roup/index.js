const sdk = require("@defillama/sdk");
const http =  require('../helper/http')

const Tokens = {
  ROUP: "0x5a1c3f3aaE616146C7b9bf9763E0ABA9bAFc5eaE",
  MAPO: "0xF73C6a12d70Fde8d1cc42229970A529996B1eb24",
  STST: "0xF5a59f961a8e86285Dae2e45ac4Ae50E4E47Ba97",
  ORDI: "0x9CA528368964cFb92cfFdd51dCcED25E27ACCef9",
  RATS: "0x6369414F2b0e973c7E85A362141aA1430bc30056",
  MMSS: "0x0fBb3B3Fb1e928f75B3Ed8b506bAb4503373fdca",
  CSAS: "0x141b30Dd30FAFb87ec10312d52e5dbD86122FE14",
  BTCS: "0xBE81B9390D894fEBf5e5D4Ea1486a003C1e8dc63",
  "3518": "0xA332EA6eb28A3cFd630bA402832b8e3d3462870E",
  SATS: "0x3Dd99381218990A32cc10918d39c20bc70685f40",
  XDAO: "0x9596a3F29E53aEC45594e8F90A976F163791378C",
  BLLB: "0x91C0815dA9A41B66Ba5a53739Ce4411a9beaFA8F",
  LSGS: "0x756af1d3810a01d3292fad62f295bbcc6c200aea",
  MMQQ: "0x5a91ca4004ada972d50edc5c012080b3158219b1",
  EEAA: "0x040A66eD7deF1c037c5c9848bc5D44dCd3B0Fc62",
  MBTC: "0x15BB20280322c9ECb9D4E9103C1CE6365d6a1Fd8"
}

const Manager = "0x57E9094f501573e6Eb7e19aCe9D8E263D11fc8ba";

const getPrices = (tokens) => {
  return http.get(`https://api.coingecko.com/api/v3/simple/price?ids=${
    tokens.join(',')}
  }&vs_currencies=usd`);
}

async function tvl(ts, block, _2, { api }) {
  const names = Object.keys(Tokens);
  const { output: totalSupplies } = await sdk.api.abi.multiCall({
    calls: names.map((name) => {
      return {
        target: Tokens[name],
        params: []
      }
    }),
    abi: "uint256:totalSupply",
    chain: "map"
  })

  const {output: managerBalances} = await sdk.api.abi.multiCall({
    calls: names.map((name) => {
      return {
        target: Tokens[name],
        params: [Manager]
      }
    }),
    abi: "erc20:balanceOf",
    chain: "map"
  })
  api.addBalances(names.reduce((acc, name, index) => {
    const balance = (totalSupplies[index].output / 10 ** 18) + (managerBalances[index].output / 10 ** 18);
    return {
      ...acc,
      [name]: balance
    }
  }, {}))
  return api.getBalances();
}


module.exports = {
  timetravel: false,
  methodology: `Tvl of ROUP on Map Protocol`,
  map: {
    tvl,
  }
}

