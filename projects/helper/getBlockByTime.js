const web3 = require('../config/web3.js');

const moment = require('moment')

const toDate = require('./timestampToDate')

/**
 * Find nearest block to given timestamp, expect timestamp in seconds
 */
module.exports = async (targetTimestamp, lowerLimitStamp, higherLimitStamp) => {
  // target timestamp or last midnight
  targetTimestamp = targetTimestamp || moment.utc().startOf('day').unix()


  // decreasing average block size will decrease precision and also
  // decrease the amount of requests made in order to find the closest
  // block
  let averageBlockTime = 17 * 1.5

  // get current block number
  const currentBlockNumber = await web3.eth.getBlockNumber()
  let block = await web3.eth.getBlock(currentBlockNumber)

  let requestsMade = 0

  let blockNumber = currentBlockNumber

  while(block.timestamp > targetTimestamp){

    let decreaseBlocks = (block.timestamp - targetTimestamp) / averageBlockTime
    decreaseBlocks = parseInt(decreaseBlocks)

    if(decreaseBlocks < 1){
      break
    }

    blockNumber -= decreaseBlocks

    block = await web3.eth.getBlock(blockNumber)
    requestsMade += 1
  }

  // if we undershoot the day
  if(lowerLimitStamp && block.timestamp < lowerLimitStamp) {


    while(block.timestamp < lowerLimitStamp){

      blockNumber += 1
      block = await web3.eth.getBlock(blockNumber)
      requestsMade += 1
    }
  }

  if(higherLimitStamp) {

    // if we ended with a block higher than we can
    // walk block by block to find the correct one
    if( block.timestamp >= higherLimitStamp ) {
      while(block.timestamp >= higherLimitStamp){
        blockNumber -= 1

        block = await web3.eth.getBlock(blockNumber)
        requestsMade += 1
      }
    }

    // if we ended up with a block lower than the upper limit
    // walk block by block to make sure it's the correct one
    if(block.timestamp < higherLimitStamp) {

      while(block.timestamp < higherLimitStamp){
        blockNumber += 1

        if(blockNumber > currentBlockNumber) break;

        const tempBlock = await web3.eth.getBlock(blockNumber)

        // can't be equal or higher than upper limit as we want
        // to find the last block before that limit
        if(tempBlock.timestamp >= higherLimitStamp){
          break
        }

        block = tempBlock

        requestsMade += 1
      }
    }
  }

  // console.log( "tgt timestamp   ->", targetTimestamp)
  // console.log( "tgt date        ->", toDate(targetTimestamp))
  // console.log( "" )
  //
  // console.log( "block timestamp ->", block.timestamp)
  // console.log( "block date      ->", toDate(block.timestamp))
  // console.log( "" )
  //
  // console.log( "requests made   ->", requestsMade)

  return block
}
