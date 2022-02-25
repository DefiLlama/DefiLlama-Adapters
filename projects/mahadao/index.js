const {getArthTvl} = require('../helper/arth');
const { staking } = require('../helper/staking');
const utils = require('../helper/utils');

async function polygon() {
  const res = await utils.fetchURL('https://api.curve.fi/api/getTVLPolygon');
  return res.data.data.tvl;
}

async function bsc() {
  const res = await utils.fetchURL('https://api.curve.fi/api/getTVLFantom');
  return res.data.data.tvl;
}


async function fetch() {
  return (await bsc())+(await polygon());
}


module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Deposited collateral in troves used to mint ARTH",
  polygon:{
    staking: staking(
      "0x8f2c37d2f8ae7bce07aa79c768cc03ab0e5ae9ae", // stakingContract
      "0xedd6ca8a4202d4a36611e2fff109648c4863ae19", // stakingToken
      "polygon" // chain
    ),
    tvl: getArthTvl([
      // troves
      "0x5344950d34E8959c7fb6645C839A7cA89BE18216", // weth
      "0x7df27F6B3C8A2b6219352A434872DcDd8f5a50E4", // dai
      "0x8C021C5a2910D1812542D5495E4Fbf6a6c33Cb4f", // wmatic
    ], [
      // collaterals
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // weth
      "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // dai
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
    ], "polygon")
  },
  bsc:{
    tvl: getArthTvl([
      // troves
      "0x8F2C37D2F8AE7Bce07aa79c768CC03AB0E5ae9aE", // wbnb
      "0x1Beb8b4911365EabEC68459ecfe9172f174BF0DB", // busd
      "0xD31AC58374D4a0b3C58dFF36f2F59A22348159DB", // maha
    ], [
      // collaterals
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // wbnb
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // busd
      "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b", // maha
    ], "bsc", [
      undefined, undefined, 'mahadao'
    ], [
      undefined, undefined, 18
    ])
  },
};
