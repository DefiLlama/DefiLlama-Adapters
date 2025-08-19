const { aaveV2Export, methodology } = require('../helper/aave')

const LENDING_POOL = '0x09e7b6BF92ba8566939d59fE3e3844385d492E77';


module.exports = {
  methodology,
  crossfi:  aaveV2Export(LENDING_POOL)
};