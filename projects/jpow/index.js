const { PublicKey } = require("@solana/web3.js");
const { Program } = require("@coral-xyz/anchor");
const sdk = require('@defillama/sdk')
const { getProvider } = require('../helper/solana');
const { JpowLending } = require('./idl');

const JPOW_PROGRAM_ID = new PublicKey('3APJcbC2iHEFGv4y6a8Fi5nQ5u75ML85TQreSr7cpRDs');

const DEPOSITORY_TYPE1_SEED = "DEPOSITORY_TYPE_1";
const SWAP_USDAI_SEED = "SWAP_USDAI";

async function tvl() {
    const provider = await getProvider();
    const balances = {};
    const program = new Program(JpowLending, JPOW_PROGRAM_ID, provider);

    const depositoryType0 = await program.account.type0Depository.all();
    depositoryType0.forEach(depository => {
        const collateral = depository.account.collateral.toString();
        sdk.util.sumSingleBalance(balances, collateral, depository.account.collateralTotal, 'solana');
    });

    const [depositoryType1Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(DEPOSITORY_TYPE1_SEED)],
        JPOW_PROGRAM_ID
    );
    const depositoryType1 = await program.account.type1Depository.fetch(depositoryType1Pda);
    depositoryType1.collateralType1.forEach(collateral => {
        const mint = collateral.collateralMint.toString();
        if (mint === PublicKey.default.toString()) return;
        sdk.util.sumSingleBalance(balances, mint, collateral.collateralTotal, 'solana');
    });

    const [swapUsdaiPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SWAP_USDAI_SEED)],
        JPOW_PROGRAM_ID
    );
    const swapUsdai = await program.account.swapUsdaiConfig.fetch(swapUsdaiPda);
    swapUsdai.stablecoins.forEach(stablecoin => {
        const mint = stablecoin.address.toString();
        if (mint === PublicKey.default.toString()) return;
        sdk.util.sumSingleBalance(balances, mint, stablecoin.swappedAmount, 'solana');
    });

    return balances;
}


module.exports = {
    timetravel: false,
    solana: {
      tvl,
    }
};