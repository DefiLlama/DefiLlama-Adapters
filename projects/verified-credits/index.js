const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const chain = "kava";
const contractOwner = "0x0a3b0C346cEE826aa0eBEf78c1eBcB9BE07aD2eb";
const addresses = [
  "0xABd380327Fe66724FFDa91A87c772FB8D00bE488",
  "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b",
  "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
  "0xB44a9B6905aF7c801311e8F4E76932ee959c663C"
]

const tvl = async() => {
  let value = 0;
  for (let index = 0; index < addresses.length; index++) {
    const address = addresses[index];
    const decimal = await sdk.api2.erc20.decimals(address, chain);
    const val = await sdk.api2.erc20.balanceOf({ target: address, owner: contractOwner, chain: chain });
    value += BigNumber(val.output).dividedBy(BigNumber(10).pow(decimal.output)).toNumber();
  }
  return value;
}

module.exports = { kava: { tvl: tvl() } }