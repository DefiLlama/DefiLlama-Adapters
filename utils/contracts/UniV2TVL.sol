// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniswapV2Pair {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function getReserves()
        external
        view
        returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface IUniswapV2Factory {
    function allPairsLength() external view returns (uint);

    function allPairs(uint) external view returns (address);
}

contract UniV2TVL {
    struct KeyValuePair {
        address key;
        uint value;
    }

    mapping(address => uint) public tvlMap;
    mapping(address => bool) public isBaseToken;
    address[] public tokens;

    constructor(
        address factory,
        address[] memory baseTokens,
        bool includeQuoteTokens,
        uint startIndex,
        uint endIndex
    ) {
        IUniswapV2Factory uniswapFactory = IUniswapV2Factory(factory);
        uint pairCount = uniswapFactory.allPairsLength();
        if (endIndex == 0 || endIndex > pairCount) endIndex = pairCount;

        // Create a set of base tokens for efficient membership check
        for (uint i = 0; i < baseTokens.length; i++) {
            isBaseToken[baseTokens[i]] = true;
        }

        for (uint i = startIndex; i < endIndex; i++) {
            address pairAddress = uniswapFactory.allPairs(i);
            IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
            address token0 = pair.token0();
            address token1 = pair.token1();
            uint reserve0;
            uint reserve1;
            (reserve0, reserve1, ) = pair.getReserves();
            bool isToken0BaseToken = isBaseToken[token0];
            bool isToken1BaseToken = isBaseToken[token1];
            
            if ( reserve0 == 0 || reserve1 == 0) continue;

            if (isToken0BaseToken && isToken1BaseToken) {
                if (tvlMap[token0] == 0) tokens.push(token0);
                if (tvlMap[token1] == 0) tokens.push(token1);
                tvlMap[token0] += reserve0;
                tvlMap[token1] += reserve1;
            } else if (isToken0BaseToken) {
                if (tvlMap[token0] == 0) tokens.push(token0);
                tvlMap[token0] += reserve0 * 2;
            } else if (isToken1BaseToken) {
                if (tvlMap[token1] == 0) tokens.push(token1);
                tvlMap[token1] += reserve1 * 2;
            } else if (includeQuoteTokens) {
                if (tvlMap[token0] == 0) tokens.push(token0);
                if (tvlMap[token1] == 0) tokens.push(token1);
                tvlMap[token0] += reserve0;
                tvlMap[token1] += reserve1;
            }
        }

        KeyValuePair[] memory returnData = new KeyValuePair[](tokens.length);
        for (uint i = 0; i < tokens.length; i++) {
            returnData[i] = KeyValuePair(tokens[i], tvlMap[tokens[i]]);
        }

        // encode the return data
        bytes memory _data = abi.encode(returnData);
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
