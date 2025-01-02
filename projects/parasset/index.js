const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking");

const PUSDMorPool = "0x505eFcC134552e34ec67633D1254704B09584227"; // Mortgage-PUSD pool contract
const PETHMorPool = "0x9a5C88aC0F209F284E35b4306710fEf83b8f9723"; //Mortgage-PETH pool contract
const NEST = "0x04abeda201850ac0124161f037efd70c74ddc74c";
const ETH = ADDRESSES.null;

const PUSDInsPool = "0x79025438C04Ae6A683Bcc7f7c51a01Eb4C2DDabA"; //Insurance-USD pool contract
const PUSD = "0xCCEcC702Ec67309Bc3DDAF6a42E9e5a6b8Da58f0";
const USDT = ADDRESSES.ethereum.USDT;

const PETHInsPool = "0x0bd32fFC80d5B98E403985D4446AE3BA67528C2e"; //Insurance-ETH pool contract
const PETH = "0x53f878fb7ec7b86e4f9a0cb1e9a6c89c0555fbbd";

async function ethTvl() {
  const balances = {};

  const ethBalance = (
    await sdk.api.eth.getBalance({
      target: PUSDMorPool,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, ETH, ethBalance);

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
    staking: stakings([PUSDMorPool, PETHMorPool], NEST),
  },
  methodology:
    "Counts liquidty on the Insurance",
};
