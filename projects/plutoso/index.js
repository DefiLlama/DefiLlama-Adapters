const { sumTokens2, getProvider } = require("../helper/solana");
const { Program } = require("@coral-xyz/anchor");
const PlutosoIDL = require("./idl.json");
const BN = require("bn.js");
const PlutosoEarnVault = {
    "usdc": "B8XucXYezRxkEZyw7PJHbVWAwQtSebnAt9JzBrbxFeHx",
    "pyusd": "4T6ZKhGZZkAQdSrVPBFskQVvKCgx8pMGoAvcDXaNZbMe",
    "sol": "FdcW9pCEV8gC1moEBAJeDfjHMRBAyKkuigkVRY4qoCme",
    "hnst": "C5uSiUij9P6nWUQBDF8CeJQnYQMeKJWhANRDirGHHD28",
};
const PlutosoLeverageVault = {
    "jlpUsdc": "1tkJdPPbqeZ9WPt1gqm2Vpfq6txsz6fDq1okbn4u4Gc",
    "jlpPyusd": "Bz5C2aaRiWhATjrYSvoAHQDKrH9ACRvp68a6dzNpSSan",
    "infSol": "FLsNFgMCKFU1BcqhEkGkCqP1CePo4mwXWyXRSpKh4rmP",
};

async function tvl(api) {
    await Promise.all([
        earnUsdcTvl(api),
        earnPyusdTvl(api),
        earnSolTvl(api),
        leverageJlpUsdcTvl(api),
        leverageJlpPyusdTvl(api),
        leverageInfSolTvl(api),
    ]);

    return sumTokens2({
        api
    });
}

async function borrowed(api) {
    await Promise.all([
        leverageJlpUsdcTvl(api, true),
        leverageJlpPyusdTvl(api, true),
        leverageInfSolTvl(api, true),
    ]);

    return sumTokens2({
        api
    });
}

async function staking(api) {
    const provider = getProvider();

    const pluto = new Program(PlutosoIDL, provider);

    const [
        earnHnst,
    ] = await Promise.all([
        pluto.account.vaultEarn.fetch(PlutosoEarnVault.hnst),
    ]);

    let unitHnst = new BN(earnHnst.unitSupply).div(new BN(10 ** 8));
    let indexHnst = new BN(earnHnst.index).div(new BN(10 ** 12));

    let amountHnst = unitHnst.mul(indexHnst);

    api.addToken(earnHnst.tokenMint.toString(), amountHnst.mul(new BN(10 ** earnHnst.tokenDecimal)));
}

async function earnUsdcTvl(api) {
    const provider = getProvider();

    const pluto = new Program(PlutosoIDL, provider);

    const [
        earnUSDC,
    ] = await Promise.all([
        pluto.account.vaultEarn.fetch(PlutosoEarnVault.usdc),
    ]);

    let unitUsdc = new BN(earnUSDC.unitSupply).sub(new BN(earnUSDC.unitBorrowed)).div(new BN(10 ** 8));
    let indexUsdc = new BN(earnUSDC.index).div(new BN(10 ** 12));

    let amountUsdc = unitUsdc.mul(indexUsdc);

    api.addToken(earnUSDC.tokenMint.toString(), amountUsdc.mul(new BN(10 ** earnUSDC.tokenDecimal)));
}

async function leverageJlpUsdcTvl(api, isBorrow = false) {
    const provider = getProvider();

    const pluto = new Program(PlutosoIDL, provider);

    const [
        leverageJlpUsdc,
    ] = await Promise.all([
        pluto.account.vaultLeverage.fetch(PlutosoLeverageVault.jlpUsdc),
    ]);

    if (isBorrow) {
        let borrowUsdc = new BN(leverageJlpUsdc.borrowingUnitSupply).div(new BN(10 ** 8));
        let borrowIndexUsdc = new BN(leverageJlpUsdc.borrowingIndex).div(new BN(10 ** 12));

        let amountBorrowUsdc = borrowUsdc.mul(borrowIndexUsdc);

        api.addToken(leverageJlpUsdc.tokenCollateralTokenMint.toString(), amountBorrowUsdc.mul(new BN(10 ** leverageJlpUsdc.tokenCollateralTokenDecimal)));
    }else {
        let unitJlp = new BN(leverageJlpUsdc.unitSupply).div(new BN(10 ** 8));
        let indexJlp = new BN(leverageJlpUsdc.index).div(new BN(10 ** 12));

        let amountJlp = unitJlp.mul(indexJlp);

        api.addToken(leverageJlpUsdc.nativeCollateralTokenMint.toString(), amountJlp.mul(new BN(10 ** leverageJlpUsdc.nativeCollateralTokenDecimal)));
    }
}

async function earnPyusdTvl(api) {
    const provider = getProvider();

    const pluto = new Program(PlutosoIDL, provider);

    const [
        earnPyusd,
    ] = await Promise.all([
        pluto.account.vaultEarn.fetch(PlutosoEarnVault.pyusd),
    ]);

    let unitPyusd = new BN(earnPyusd.unitSupply).sub(new BN(earnPyusd.unitBorrowed)).div(new BN(10 ** 8));
    let indexPyusd = new BN(earnPyusd.index).div(new BN(10 ** 12));

    let amountPyusd = unitPyusd.mul(indexPyusd);

    api.addToken(earnPyusd.tokenMint.toString(), amountPyusd.mul(new BN(10 ** earnPyusd.tokenDecimal)));
}

async function leverageJlpPyusdTvl(api, isBorrow = false) {
    const provider = getProvider();

    const pluto = new Program(PlutosoIDL, provider);

    const [
        leverageJlpPyusd,
    ] = await Promise.all([
        pluto.account.vaultLeverage.fetch(PlutosoLeverageVault.jlpPyusd),
    ]);

    if (isBorrow) {
        let borrowPyusd = new BN(leverageJlpPyusd.borrowingUnitSupply).div(new BN(10 ** 8));
        let borrowIndexPyusd = new BN(leverageJlpPyusd.borrowingIndex).div(new BN(10 ** 12));

        let amountBorrowPyusd = borrowPyusd.mul(borrowIndexPyusd);

        api.addToken(leverageJlpPyusd.tokenCollateralTokenMint.toString(), amountBorrowPyusd.mul(new BN(10 ** leverageJlpPyusd.tokenCollateralTokenDecimal)));
    } else {
        let unitJlp = new BN(leverageJlpPyusd.unitSupply).div(new BN(10 ** 8));
        let indexJlp = new BN(leverageJlpPyusd.index).div(new BN(10 ** 12));

        let amountJlp = unitJlp.mul(indexJlp);

        api.addToken(leverageJlpPyusd.nativeCollateralTokenMint.toString(), amountJlp.mul(new BN(10 ** leverageJlpPyusd.nativeCollateralTokenDecimal)));
    }
}

async function earnSolTvl(api) {
    const provider = getProvider();

    const pluto = new Program(PlutosoIDL, provider);

    const [
        earnSol,
    ] = await Promise.all([
        pluto.account.vaultEarn.fetch(PlutosoEarnVault.sol),
    ]);

    let unitSol = new BN(earnSol.unitSupply).sub(new BN(earnSol.unitBorrowed)).div(new BN(10 ** 8));
    let indexSol = new BN(earnSol.index).div(new BN(10 ** 12));

    let amountSol = unitSol.mul(indexSol);

    api.addToken(earnSol.tokenMint.toString(), amountSol.mul(new BN(10 ** earnSol.tokenDecimal)));
}

async function leverageInfSolTvl(api, isBorrow = false) {
    const provider = getProvider();

    const pluto = new Program(PlutosoIDL, provider);

    const [
        leverageInfSol,
    ] = await Promise.all([
        pluto.account.vaultLeverage.fetch(PlutosoLeverageVault.infSol),
    ]);

    if (isBorrow) {
        let borrowSol = new BN(leverageInfSol.borrowingUnitSupply).div(new BN(10 ** 8));
        let borrowIndexSol = new BN(leverageInfSol.borrowingIndex).div(new BN(10 ** 12));

        let amountBorrowPyusd = borrowSol.mul(borrowIndexSol);

        api.addToken(leverageInfSol.tokenCollateralTokenMint.toString(), amountBorrowPyusd.mul(new BN(10 ** leverageInfSol.tokenCollateralTokenDecimal)));
    } else {
        let unitInf = new BN(leverageInfSol.unitSupply).div(new BN(10 ** 8));
        let indexInf = new BN(leverageInfSol.index).div(new BN(10 ** 12));

        let amountInf = unitInf.mul(indexInf);

        api.addToken(leverageInfSol.nativeCollateralTokenMint.toString(), amountInf.mul(new BN(10 ** leverageInfSol.nativeCollateralTokenDecimal)));
    }
}

module.exports = {
    timetravel: false,
    methodology: "The Total Value Locked (TVL) is calculated as the sum of leveraged position assets and the available assets deposited in Earn Vaults.",
    solana: {
        staking,
        tvl,
        borrowed,
    },
};
