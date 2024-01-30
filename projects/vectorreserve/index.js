// Token Contracts
const WETH_CONTRACT = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const VETH_CONTRACT = '0x38D64ce1Bdf1A9f24E0Ec469C9cAde61236fB4a0';
const VEC_CONTRACT = '0x1BB9b64927e0C5e207C9DB4093b3738Eef5D8447';
const SVEC_CONTRACT = '0x66d5c66E7C83E0682d947176534242c9f19b3365';

// Bond Contracts
const WETHBOND_CONTRACT = '0xFc55d0E3045baE717Ad06D7642228405b365a013'
const WETHTOLPBOND_CONTRACT = '0xA6E3d8B20a5DC12c986AF63E496B8D585117aBBd';
const VETHETHBOND_CONTRACT= '0xc61a679B14Da92BfAF9f1f28C502c438b0eEdaB8'

// ABIs
const SVEC_ABI = require("./svec.json");
const WETHBOND_ABI = require("./bonds.json");

async function tvl(_, _1, _2, { api }) {
    let tokens = [];
    let balances = [];

    // vETH Supply + sVEC Supply
    const vETHSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: VETH_CONTRACT,
        params: [],
    });
    tokens.push(WETH_CONTRACT);
    balances.push(vETHSupply);

    const sVECSupply = await api.call({
        abi: SVEC_ABI,
        function: 'circulatingSupply',
        target: SVEC_CONTRACT,
        params: [],
    });
    tokens.push(VEC_CONTRACT);
    balances.push(sVECSupply);

    // Bonds
    const wETHBond_TBV = await api.call({
        abi: WETHBOND_ABI,
        function: 'totalPrincipalBonded',
        target: WETHBOND_CONTRACT,
        params: [],
    });
    tokens.push(WETH_CONTRACT);
    balances.push(wETHBond_TBV);

    const wETHToLPBond_TBV = await api.call({
        abi: WETHBOND_ABI,
        function: 'totalPrincipalBonded',
        target: WETHTOLPBOND_CONTRACT,
        params: [],
    });
    tokens.push(WETH_CONTRACT);
    balances.push(wETHToLPBond_TBV);

    const vETHETHBond_TBV = await api.call({
        abi: WETHBOND_ABI,
        function: 'totalPrincipalBonded',
        target: VETHETHBOND_CONTRACT,
        params: [],
    });
    tokens.push(WETH_CONTRACT);
    balances.push(vETHETHBond_TBV);

    // Add all tokens and balances to TVL
    api.addTokens(tokens, balances)
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'vETH TVL + sVEC TVL + Bonds TVL',
    start: 19067821,
    ethereum: {
        tvl,
    }
}; 