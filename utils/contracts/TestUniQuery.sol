// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniswapV2Factory {
    function allPairsLength() external view returns (uint);

    function allPairs(uint) external view returns (address);
}

contract TestUniQuery {
    constructor(address factory) {
        IUniswapV2Factory uniswapFactory = IUniswapV2Factory(factory);
        uint pairCount = uniswapFactory.allPairsLength();

        // encode the return data
        bytes memory _data = abi.encode(pairCount);
        // force constructor to return data via assembly
        assembly {
            // abi.encode adds an additional offset (32 bytes) that we need to skip
            let _dataStart := add(_data, 32)
            // msize() gets the size of active memory in bytes.
            // if we subtract msize() from _dataStart, the output will be
            // the amount of bytes from _dataStart to the end of memory
            // which due to how the data has been laid out in memory, will coincide with
            // where our desired data ends.
            let _dataEnd := sub(msize(), _dataStart)
            // starting from _dataStart, get all the data in memory.
            return(_dataStart, _dataEnd)
        }
    }
}
