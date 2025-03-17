async function tvl(_, block) {
    console.log("🚨 Inside TVL Function...");
    console.log("🚀 Starting TVL calculation...");

    let totalTVL = new BigNumber(0);

    for (const synth of SYNTHS) {
        console.log(`🔍 Attempting to fetch total supply for ${synth.symbol} at address ${synth.address}`);

        try {
            const { output: totalSupply } = await sdk.api.abi.call({
                abi: SYNTH_ABI,
                target: synth.address,
                chain: 'bsc',
                block
            });

            console.log(`✅ Raw Response for ${synth.symbol}:`, totalSupply);

            if (!totalSupply) {
                console.warn(`⚠️ Warning: Total supply for ${synth.symbol} returned as NULL or 0. Possible RPC issue.`);
                continue;
            }

            const supplyInUnits = new BigNumber(totalSupply).dividedBy(10 ** synth.decimals);
            totalTVL = totalTVL.plus(supplyInUnits);

            console.log(`✅ ${synth.symbol} Total Supply Retrieved: ${totalSupply}`);
            console.log(`Updated Total TVL: ${totalTVL.toFixed(2)}`);
        } catch (error) {
            console.error(`❌ Error fetching total supply for ${synth.symbol}: ${error.message}`);
        }
    }

    console.log(`✅ Final Total TVL Calculated: ${totalTVL.toFixed(2)}`);
    return {
        'bsc:usd': totalTVL.toFixed(2)
    };
}
