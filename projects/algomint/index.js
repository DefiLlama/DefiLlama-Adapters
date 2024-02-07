const { tokens } = require("../helper/chain/algorand");

const { lpTokenPostion } = require("./utils");

//Algomint Basket contracts where the liquidty is held
const goUsdcBasketAddress =
  "S3VJZN4AXUP3IZKE4O7TUN6LRIEYNJCMXQSFP6DPGUKU6YYK2VLN2W7DXA";
const goUsdtBasketAddress =
  "CX7ICRT4HRKHZSSYYMW765AKSBDH3XJBQZ2DXN32DCWTD2732RVHR25Y5Q";
const goXusdBasketAddress =
  "ZFWCUIFTE5CKDEFBL3KBQA5OIVLFOG2D7MN7UUK7ZKIW2QVOLAYBR2L5WE";
const goBtcBasketAddress =
  "MGGJI6CKRMIEN7CGXY2SK3KTPRCXW4SNPDPN4G7RWON4DB4262G4IRFHXE";
const goEthBasketAddress =
  "IUTNDPUTZ5MKFFIZ5L7MG35I5WXS64LLJKVXRTJNJISBRPOTOAM3DA65CY";
const goWusdcBasketAddress = "HGKK45FRG5XLUE232664RC7HXQEF52YIUXHRYXJYZW5GT2SWUNTI4M3FOQ";
const goWusdtBasketAddress = "MEZOSEZWLVZYSOBCZYUYSKL7LS5JTIV5G2TBX6M3FFINUKP3BJVVA2S5T4";

//The following pool ID's are the PACT LP pool contracts
const usdcPoolId = 885102197;
const usdtPoolId = 1081978547;
const xusdPoolId = 1081974468;
const wBtcPoolId = 1058934586;
const wEthPoolId = 1058935016;
const wUsdcPoolId = 1242543233;
const wUsdtPoolId = 1242550428;

async function tvl() {
  //Returns the position of the LP token.
  const usdcPostion = await lpTokenPostion(
    tokens.usdcGoUsdLp,
    usdcPoolId,
    goUsdcBasketAddress
  );

  const usdtPosition = await lpTokenPostion(
    tokens.usdtGoUsdLp,
    usdtPoolId,
    goUsdtBasketAddress
  );

  const wusdcPostion = await lpTokenPostion(
    tokens.wusdcGoUsdLp,
    wUsdcPoolId,
    goWusdcBasketAddress
  );

  const wusdtPosition = await lpTokenPostion(
    tokens.wusdtGoUsdLp,
    wUsdtPoolId,
    goWusdtBasketAddress
  );

  const xusdPosition = await lpTokenPostion(
    tokens.xUsdGoUsdLp,
    xusdPoolId,
    goXusdBasketAddress
  );

  const wBtcPosition = await lpTokenPostion(
    tokens.wBtcGoBtcLp,
    wBtcPoolId,
    goBtcBasketAddress
  );

  const wEthPosition = await lpTokenPostion(
    tokens.wEthGoEthLp,
    wEthPoolId,
    goEthBasketAddress
  );

  //positionA is USDC in the LP
  const usdcTvlvalue = usdcPostion.positionA / 10 ** 6;
  //positionA is USDT in the LP
  const usdtTvlValue = usdtPosition.positionA / 10 ** 6;
  //positionB is XUSD in the LP
  const xusdtTvlValue = xusdPosition.positionB / 10 ** 6;
  //positionB is wUSDC in the LP
  const wusdcTvlValue = wusdcPostion.positionB / 10 ** 6;
  //positionB is wUSDT in the LP
  const wusdtTvlValue = wusdtPosition.positionB / 10 ** 6;
  //positionB is wBTC in the LP
  const wBtcTvlValue = wBtcPosition.positionB / 10 ** 8;
  //positionB is wEth in the LP
  const wEthTvlValue = wEthPosition.positionB / 10 ** 8;
  return {
    bitcoin: wBtcTvlValue,
    ethereum: wEthTvlValue,
    tether: usdtTvlValue + wusdtTvlValue,
    usd: usdcTvlvalue + xusdtTvlValue + wusdcTvlValue,
  };
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl,
  },
};
