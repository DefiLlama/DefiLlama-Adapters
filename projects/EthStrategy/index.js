const USDS_CONTRACT_ADDRESS = '0xdC035D45d973E3EC169d2276DDab16f1e407384F';
const ESPN_CONTRACT_ADDRESS = '0xb250C9E0F7bE4cfF13F94374C993aC445A1385fE';
const ARRAKIS_V2_VAULT = '0x2f63ae2184d876f156b9ef21f488d4e6b442fad7';
const POSITION_MANAGER = '0xd840e7ca51c2106c1169a4e28cd6b4a048a15960';
const UNISWAP_V3_POOL = '0x6007905d106ca97f4fe032d818e815657122b01e';

// ABIs
const ESPN_ABI = {
    totalAssets: "function totalAssets() view returns (uint256)",
    asset: "function asset() view returns (address)"
};

const ARRAKIS_ABI = {
    getPositionsAndRanges: "function getPositionsAndRanges() view returns (uint256[] memory, int24[] memory, int24[] memory)"
};

const POSITION_MANAGER_ABI = {
    tokenOfOwnerByIndex: "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    balanceOf: "function balanceOf(address owner) view returns (uint256)",
    positions: "function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)"
};

const POOL_ABI = {
    slot0: "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
};

// Math helper functions
function sqrtRatioAtTick(tick) {
    // Calculate sqrt(1.0001^tick) * 2^96
    // Using BigInt for precision
    const Q96 = 2n ** 96n;
    const tickBigInt = BigInt(tick);
    
    // Approximate calculation - for production use a proper math library
    // This is a simplified version
    let ratio = 1.0001 ** Number(tick);
    let sqrtRatio = Math.sqrt(ratio);
    
    // Convert to Q96 format
    return BigInt(Math.floor(sqrtRatio * Number(Q96)));
}

function calculateToken0Amount(liquidity, sqrtPriceX96, sqrtRatioAX96, sqrtRatioBX96) {
    const Q96 = 2n ** 96n;
    const liquidityBigInt = BigInt(liquidity);
    
    if (sqrtPriceX96 <= sqrtRatioAX96) {
        return liquidityBigInt * (sqrtRatioBX96 - sqrtRatioAX96) / sqrtRatioBX96;
    } else if (sqrtPriceX96 < sqrtRatioBX96) {
        return liquidityBigInt * (sqrtRatioBX96 - sqrtPriceX96) / (sqrtRatioBX96 * sqrtPriceX96 / Q96);
    } else {
        return 0n;
    }
}

function calculateToken1Amount(liquidity, sqrtPriceX96, sqrtRatioAX96, sqrtRatioBX96) {
    const Q96 = 2n ** 96n;
    const liquidityBigInt = BigInt(liquidity);
    
    if (sqrtPriceX96 <= sqrtRatioAX96) {
        return 0n;
    } else if (sqrtPriceX96 < sqrtRatioBX96) {
        return liquidityBigInt * (sqrtPriceX96 - sqrtRatioAX96) / Q96;
    } else {
        return liquidityBigInt * (sqrtRatioBX96 - sqrtRatioAX96) / Q96;
    }
}

async function getUniswapV3PositionValue(api) {
    // Step 1: Get position count from Position Manager
    const positionCount = await api.call({
        abi: POSITION_MANAGER_ABI.balanceOf,
        target: POSITION_MANAGER,
        params: [ARRAKIS_V2_VAULT]
    });

    console.log("Position count:", positionCount.toString());

    // Step 2: Get all position IDs
    const positionIds = [];
    const calls = [];
    for (let i = 0; i < Number(positionCount); i++) {
        calls.push({
            target: POSITION_MANAGER,
            params: [ARRAKIS_V2_VAULT, i]
        });
    }

    if (calls.length > 0) {
        const tokenIds = await api.multiCall({
            abi: POSITION_MANAGER_ABI.tokenOfOwnerByIndex,
            calls: calls
        });
        positionIds.push(...tokenIds);
    }

    console.log("Position IDs:", positionIds);

    // Step 3: Get position data for all positions
    const positionCalls = positionIds.map(tokenId => ({
        target: POSITION_MANAGER,
        params: [tokenId]
    }));

    const positions = await api.multiCall({
        abi: POSITION_MANAGER_ABI.positions,
        calls: positionCalls
    });

    // Step 4: Get current pool price (slot0)
    const slot0 = await api.call({
        abi: POOL_ABI.slot0,
        target: UNISWAP_V3_POOL
    });

    const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96);
    console.log("Current sqrt price:", sqrtPriceX96.toString());

    // Step 5: Calculate USDS amount for each position
    let totalUSDSAmount = 0n;

    for (let i = 0; i < positions.length; i++) {
        const position = positions[i];
        const liquidity = BigInt(position.liquidity);
        const tickLower = Number(position.tickLower);
        const tickUpper = Number(position.tickUpper);

        console.log(`Position ${i}:`, {
            liquidity: liquidity.toString(),
            tickLower,
            tickUpper
        });

        if (liquidity > 0n) {
            const sqrtRatioAX96 = sqrtRatioAtTick(tickLower);
            const sqrtRatioBX96 = sqrtRatioAtTick(tickUpper);

            // Calculate token1 amount (USDS)
            const token1Amount = calculateToken1Amount(
                liquidity,
                sqrtPriceX96,
                sqrtRatioAX96,
                sqrtRatioBX96
            );

            totalUSDSAmount += token1Amount;
            console.log(`Position ${i} USDS amount:`, token1Amount.toString());
        }
    }

    console.log("Total USDS from positions:", totalUSDSAmount.toString());
    return totalUSDSAmount.toString();
}

async function tvl(api) {
    // Part 1: Get USDS from ESPN contract
    const underlyingAsset = await api.call({
        abi: ESPN_ABI.asset,
        target: ESPN_CONTRACT_ADDRESS,
    });

    const espnTotalAssets = await api.call({
        abi: ESPN_ABI.totalAssets,
        target: ESPN_CONTRACT_ADDRESS,
    });

    console.log("ESPN total assets:", espnTotalAssets.toString());

    // Part 2: Get USDS from Uniswap V3 positions
    const uniswapUSDSAmount = await getUniswapV3PositionValue(api);

    // Add both amounts to TVL
    api.add(USDS_CONTRACT_ADDRESS, espnTotalAssets);
    api.add(USDS_CONTRACT_ADDRESS, uniswapUSDSAmount);

    console.log("Final TVL breakdown:", {
        espn: espnTotalAssets.toString(),
        uniswap: uniswapUSDSAmount.toString()
    });

    return api.getBalances();
}

module.exports = {
    methodology: 'Calculates total USDS TVL from ESPN contract totalAssets() and Uniswap V3 positions managed by Arrakis V2 vault.',
    ethereum: {
        tvl,
    },
};
