const { sumTokens } = require("./helper/unwrapLPs");
const web3 = require("./config/web3.js");

const abis = {
  totalBorrows: [{
    "constant":true,
    "inputs":[],
    "name":"totalBorrows",
    "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
    "payable":false,
    "stateMutability":"view",
    "type":"function"
  }],
  oracle: [{
    "inputs":[{"internalType":"address","name":"underlying","type":"address"}],
    "name":"price",
    "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability":"view",
    "type":"function"
  }],
};

const oneEther = new web3.utils.BN("1000000000000000000");

// Retrieve tokens stored in treasury contract - only weth at the moment
// https://arbiscan.io/address/0x5710B75A0aA37f4Da939A61bb53c519296627994
const treasuryContract = "0x5710B75A0aA37f4Da939A61bb53c519296627994";
const WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
const treasuryTokens = [WETH];
const fxTokens = {
  aud: "0x7E141940932E3D13bfa54B224cb4a16510519308",
  eur: "0x116172B2482c5dC3E6f445C16Ac13367aC3FCd35",
  php: "0x3d147cD9aC957B2a5F968dE9d1c6B9d0872286a0",
};

const oracleAddress = "0xb0602af43Ca042550ca9DA3c33bA3aC375d20Df4";
const audP76 = {
  contract: "0x65d9912a6bfbd9ad91c02f14b83eb36e027c4799",
  token: fxTokens.aud
};
const eurP76 = {
  contract: "0x72c234187df4d0fb6734afb7463351a86d023590",
  token: fxTokens.eur
};
const eurP116 = {
  contract: "0x2f97b913169a769c5b3609156a5f015ca49cefe6",
  token: fxTokens.eur
};
const audP116 = {
  contract: "0xdaa7e2957afd906af2f15c86c88ba3108389eb26",
  token: fxTokens.aud
};
const phpP116 = {
  contract: "0xbe1de1c61fd7d4553b140e0a659d0be37433a354",
  token: fxTokens.php
};

const oracle = new web3.eth.Contract(abis.oracle, oracleAddress);

async function arbitrum_onchain(timestamp, block, chainBlocks, chain) {
  const balances = {};
  await sumTokens(
    balances,
    treasuryTokens.map(t => [t, treasuryContract]),
    chainBlocks.arbitrum,
    "arbitrum",
    addr => `arbitrum:${addr}`
  );
  return balances;
}

/**
 * Calculates the TVL for a Mainnet Handle contract.
 * @param asset
 * @param ltv Must be a number with 2 decimals, max 100 (= 1.00)
 * @returns {Promise<void>}
 */
async function getHandleContractMainnetLendingTVL({ contract, token }, ltv) {
  contract = new web3.eth.Contract(abis.totalBorrows, contract);
  const totalBorrowed = new web3.utils.BN(
    (await contract.methods.totalBorrows().call()).toString()
  );
  // Get collateral accounting for TVL and convert to ETH value using oracle
  const assetPrice = new web3.utils.BN(
    (await oracle.methods.price(token).call()).toString()
  );
  return parseInt(totalBorrowed
    .mul(assetPrice)
    .mul(new web3.utils.BN("100"))
    .div(new web3.utils.BN(ltv.toString()))
    .div(oneEther).toString);
}

async function ethereum_onchain(timestamp, block, chainBlock, chain) {
  return (await Promise.all([
    await getHandleContractMainnetLendingTVL(audP76, 70),
    await getHandleContractMainnetLendingTVL(eurP76, 70),
    await getHandleContractMainnetLendingTVL(audP116, 87),
    await getHandleContractMainnetLendingTVL(eurP116, 87),
    await getHandleContractMainnetLendingTVL(phpP116, 87),
  ])).reduce((a, b) => a + b, 0)
}

module.exports = {
  arbitrum: {
    tvl: arbitrum_onchain,
  },
  ethereum: {
    tvl: ethereum_onchain,
  },
  methodology: `TVL is sum of al collateralTokens provided in vaults to mint any fxTokens. We can do an on-chain call to the ERC20 held in the treasuryContract for Arbitrum as well as for the mainnet lending contracts.`,
};
