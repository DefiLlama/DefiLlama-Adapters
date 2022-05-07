const sdk = require('@defillama/sdk');
const { BigNumber, FixedNumber } = require("ethers");

const {
  getLpPrice,
  getAmountLVtoLP,
  UsdcWevmosVaultAddress,
  DiffWevmosVaultAddress,
  WethWevmosVaultAddress
} = require('./helper');

function toDecimal(bigNumber, decimals = 18) {
  const fixedNumber = FixedNumber.fromBytes(bigNumber._hex, { width: 256, signed: true, decimals });
  const fixedStr = fixedNumber.toString();
  const [characteristic, originalMantissa = ""] = fixedStr.split(".");
  let mantissa = originalMantissa;
  mantissa = mantissa.replace(/0+$/, "");

  return mantissa ? characteristic + "." + mantissa : characteristic;
}

const pools = [UsdcWevmosVaultAddress, DiffWevmosVaultAddress, WethWevmosVaultAddress];

async function fetch(timestamp, block, chainBlocks) {
  const balances = (await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    chain: 'evmos',
    calls: pools.map((target) => ({ target})),
    block: chainBlocks['evmos'],
  })).output;

  const priceMap = await getLpPrice();

  let totalValueLocked = BigNumber.from(0);

  for (const balance of balances) {
    const output = BigNumber.from(balance.output);
    const target = balance.input.target;
    const amountLVtoLP = await getAmountLVtoLP(target);
    const dlpPrice = priceMap[target]
    const vaultPrice = amountLVtoLP.mul(dlpPrice);
    totalValueLocked = totalValueLocked.add(output.mul(vaultPrice));
  }

  return toDecimal(totalValueLocked, 18 * 3);
}

module.exports = {
  evmos: {fetch},
  fetch
}
// node test.js projects/earnmos/index.js

