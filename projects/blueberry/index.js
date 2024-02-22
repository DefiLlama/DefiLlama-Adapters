const { compoundExports2 } = require('../helper/compound')
const { abi } = require('./abi.json');
const sdk = require('@defillama/sdk');

const BANK = '0x9b06eA9Fbc912845DF1302FE1641BEF9639009F7';

async function tvl(timestamp, block, chainBlocks) {
  let total = 0;
  const nextPositionId = await sdk.api.abi.call({
    target: BANK,
    abi: abi['getNextPositionId'],
    block
  }).output;

  for (let i = 0; i < nextPositionId; i++ ) {
    const positionValue = await sdk.api.abi.call({
      target: BANK,
      abi: abi['getPositionValue'],
      params: i,
      block
    }).output;
    total += positionValue;
  }

  const totalTvl = total + compoundExports2({ comptroller: '0xfFadB0bbA4379dFAbFB20CA6823F6EC439429ec2'});  
  
  return totalTvl;
}

module.exports = {
  methodology: 'Gets the total value locked in the Blueberry Lending Market and Blueberry Earn',
  ethereum: {tvl},
}