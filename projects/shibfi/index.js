const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const {getUniTVL} = require("../helper/unknownTokens");

const native_staking_contract_pool1 = "0xF04d9E9CE754c9dA855Fd6A2b84efA9d4cD293F5";
const native_staking_contract_pool2 = "0xDC8AE9ACC2ea98F7a3A40b3fFCA210435226566B";
const shibfi_staking_contract = "0x1ae96F6E24Ca24Db5cA97797E528d63bfc9dD0Ef";

const assets = [
  "0x7915fE3be85D591cC0395D30AB76Ee7aA12a085D", //WBONE
  ADDRESSES.null, // This is address of native token
  "0xa98900F53fa3e5bFe6F2283F4C4E57ca3DF5387c", // SHIBFI TOKEN
];

let owners = [native_staking_contract_pool1, native_staking_contract_pool2, shibfi_staking_contract]

let TVL_STAKING = sumTokensExport({ owners, tokens: assets })
let TVL_AMM_DEX = getUniTVL({factory: "0x7956FdCe944ed2A0e2bDF25d2de6c6b34398B657", useDefaultCoreAssets: true,})

module.exports = {
  shibarium: {
    tvl: TVL_AMM_DEX,
    staking: TVL_STAKING,
  },
};