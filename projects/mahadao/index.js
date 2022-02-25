const { getArthTvl } = require('../helper/arth');
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");


const replaceMAHAonBSCTransform = (addr) => {
  if (addr.toLowerCase() === '0xce86f7fcd3b40791f63b86c3ea3b8b355ce2685b')
    return 'mahadao';
  return `bsc:${addr}`;
};


module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Deposited collateral in troves used to mint ARTH",
  polygon: {
    staking: staking(
      "0x8f2c37d2f8ae7bce07aa79c768cc03ab0e5ae9ae", // mahax contract
      "0xedd6ca8a4202d4a36611e2fff109648c4863ae19", // maha
      "polygon"
    ),
    pool2: pool2s([
      // staking contracts
      '0xD585bfCF37db3C2507e2D44562F0Dbe2E4ec37Bc', // arth/usdc lp staking
      '0xc82c95666be4e89aed8ae10bab4b714cae6655d5', // arth/maha lp staking
    ], [
      '0x34aAfA58894aFf03E137b63275aff64cA3552a3E', // arth/usdc lp
      '0x95de8efD01dc92ab2372596B3682dA76a79f24c3', // arth/maha lp
    ], "polygon"),
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
  bsc: {
    pool2: pool2s([
      // staking contracts
      // '0x7699d230Ba47796fc2E13fba1D2D52Ecb0318c33', // arth/maha lp staking
      '0xe8b16cab47505708a093085926560a3eb32584b8', // arth/busd lp staking
    ], [
      '0x80342bc6125a102a33909d124a6c26CC5D7b8d56', // arth/busd lp
      '0xb955d5b120ff5b803cdb5a225c11583cd56b7040', // arth/maha lp
    ], "bsc", replaceMAHAonBSCTransform),
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
