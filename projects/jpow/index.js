const { PublicKey } = require("@solana/web3.js");
const { sumTokens2 } = require('../helper/solana');

const JPOW_PROGRAM_ID = new PublicKey('3APJcbC2iHEFGv4y6a8Fi5nQ5u75ML85TQreSr7cpRDs');

const DEPOSITORY_SEED = "DEPOSITORY";

// get collateral tokens supported by JPOW lending protocol
async function fetchCollateralTokens() {
    const response = await fetch('https://api.jpow.ai/lending/metrics');
    const data = await response.json();
    return data.assets.map(asset => new PublicKey(asset.contractAddress));
}

async function tvl() {
    const tokensAndOwners = [];
    const collaterals = await fetchCollateralTokens();

    // get depository of each collateral
    for (let i = 0; i < collaterals.length; i++) {
        const [depositoryPda] = PublicKey.findProgramAddressSync(
            [Buffer.from(DEPOSITORY_SEED), collaterals[i].toBuffer()],
            JPOW_PROGRAM_ID
        );

        tokensAndOwners.push([
            collaterals[i],
            depositoryPda
        ]);
    }
    return sumTokens2({ tokensAndOwners });
}


module.exports = {
    timetravel: false,
    solana: {
      tvl,
    }
  };