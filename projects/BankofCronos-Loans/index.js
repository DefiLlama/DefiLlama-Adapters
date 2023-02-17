const sdk = require("@defillama/sdk");

const CRO_ADDRESS = "0x0000000000000000000000000000000000000000";
const WCRO_ADDRESS = '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23';
const WETH_ADDRESS = '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a';
const WBTC_ADDRESS = '0x062E66477Faf219F25D27dCED647BF57C3107d52';
// Active Pool holds total system collateral value(deposited collateral)
const ACTIVE_POOL_ADDRESS = "0xa86Ba8b60Aa4d943D15FF2894964da4C2A8F1B03";
const BOC_TREASURY_ADDRESS = "0xBacF28BF21B374459C738289559EF89978D08102";
const CUSD_ADDRESS = "0x26043Aaa4D982BeEd7750e2D424547F5D76951d4";
const USDC_ADDRESS = "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59";

async function tvl(_, _block, chainBlocks) {
    const block = chainBlocks["cronos"];
    const balances = {};
  const loancollateralTvl  = (
    await sdk.api.abi.call({
      target: ACTIVE_POOL_ADDRESS,
      abi: "uint256:getVCSystem",
      block: block,
      chain: "cronos"
    })
  ).output;


  const totalcusd =  (+loancollateralTvl)

  return  {
    ["cronos:0xF2001B145b43032AAF5Ee2884e456CCd805F677D"]: totalcusd,
  }
}

module.exports = {
  timetravel: true,
  start: 6949784,
  cronos: {
    tvl,
  },
  methodology:
    "Total CDP collateral value",
};
