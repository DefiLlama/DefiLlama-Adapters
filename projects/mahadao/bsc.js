const { getArthTvl } = require('../helper/arth');
const { pool2s } = require("../helper/pool2");


const replaceMAHAonBSCTransform = (addr) => {
  if (addr.toLowerCase() === '0xce86f7fcd3b40791f63b86c3ea3b8b355ce2685b')
    return 'mahadao';
  return `bsc:${addr}`;
};


module.exports =  {
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
};
