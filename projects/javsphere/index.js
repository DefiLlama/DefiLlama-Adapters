const { staking } = require("../helper/staking.js");
const {ethers} = require("ethers");
const BigNumber = require("bignumber.js");

const STAKING_BASE = '0xE420BBb4C2454f305a3335BBdCE069326985fb5b'
const FREEZER_BASE = '0x03e225D2bd32F5ecE539005B57F9B94A743ADBFB'
const VESTING_BASE = '0x42a40321843220e9811A1385D74d9798436f7002'
const JAV_BASE = '0xEdC68c4c54228D273ed50Fc450E253F685a2c6b9'
const LEVERAGEX_BASE_EARN = '0xfd916d70eb2d0e0e1c17a6a68a7fbede3106b852'

const earnAbi = [{
  "inputs": [],
  "name": "tvl",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}];
const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
const contractEarn = new ethers.Contract(LEVERAGEX_BASE_EARN, earnAbi, provider);

async function tvl() {
  const [earnTVL] = await Promise.all([
    contractEarn.tvl(),
   ]);
  return new BigNumber(earnTVL).toNumber() / 1e18;
}

module.exports = {
  methodology: `We count the total value locked from staking and freezer of javsphers native token JAV). `,
  hallmarks: [
    [1733837635, "Migration to BASE"],
  ],
  base: {
    tvl,
    staking: staking([STAKING_BASE, FREEZER_BASE], JAV_BASE),
    vesting: staking(VESTING_BASE, JAV_BASE)
  },
  defichain_evm: {
    tvl: () => { },
    staking: () => { },
  },
  defichain: {
    tvl: () => { },
  },
}
