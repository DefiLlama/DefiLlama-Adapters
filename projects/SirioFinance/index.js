
const USDC_SIRIO_CONTRACT = '0xA810340Ca70e24aF6d6C3e59A3d2b88E6d5f1F27';
const USDC_TOKEN_CONTRACT = '0x000000000000000000000000000000000006f89a';
const SAUCE_SIRIO_CONTRACT = '0x086eDAe2722FE6F355793adF8F19fAeE93aca7d6';
const SAUCE_TOKEN_CONTRACT = '0x00000000000000000000000000000000000b2ad5';
const XSAUCE_SIRIO_CONTRACT = '0x7D0f4cD67301afAdbbBF3512F31aF9247a37e7a7';
const XSAUCE_TOKEN_CONTRACT = '0x00000000000000000000000000000000001647e8';
const HBARX_SIRIO_CONTRACT = '0xdd9FA7C0080062df71d729fBA6EEf074C5F03A45';
const HBARX_TOKEN_CONTRACT = '0x00000000000000000000000000000000000cba44';
const HBAR_SIRIO_CONTRACT = '0x0e2c1659B6A120CFE582717b51444389878676Ac';
const HBAR_TOKEN_CONTRACT = '0x0000000000000000000000000000000000163b5a';
const HSUITE_SIRIO_CONTRACT = '0xb9a76104658AbBB998C8b146dF9c523b3b3D271b';
const HSUITE_TOKEN_CONTRACT = '0x00000000000000000000000000000000000c01f3';
const PACK_SIRIO_CONTRACT = '0x23E49b26D82674eea26E49f447D8a00dae7Ff01B';
const PACK_TOKEN_CONTRACT = '0x0000000000000000000000000000000000492a28';

async function getSuppliedBalance(api, contractAddress, tokenAddress) {
    const decimals = await api.call({
        abi: 'erc20:decimals',
        target: tokenAddress,
    });
    //
    const supplied = await api.call({
        abi: {
            type: "function",
            name: "getUnderlyingBalance",
            inputs: [],
            outputs: [
                {
                    name: "",
                    type: "uint256",
                    internalType: "uint256",
                },
            ],
            stateMutability: "view",
        },
        target: contractAddress,
        params: []
    });

    return [supplied, decimals]
}

async function tvl(api) {
    const usdcBalance = await getSuppliedBalance(api, USDC_SIRIO_CONTRACT, USDC_TOKEN_CONTRACT);
    // format to right token decimals
    api.add(USDC_TOKEN_CONTRACT, usdcBalance[0] * 1000);

    const sauceBalance = await getSuppliedBalance(api, SAUCE_SIRIO_CONTRACT, SAUCE_TOKEN_CONTRACT);
    api.add(SAUCE_TOKEN_CONTRACT, sauceBalance[0]);

    const xsauceBalance = await getSuppliedBalance(api, XSAUCE_SIRIO_CONTRACT, XSAUCE_TOKEN_CONTRACT);
    api.add(XSAUCE_TOKEN_CONTRACT, xsauceBalance[0]);

    const hbarxBalance = await getSuppliedBalance(api, HBARX_SIRIO_CONTRACT, HBARX_TOKEN_CONTRACT);
    api.add(HBARX_TOKEN_CONTRACT, hbarxBalance[0]);

    const hbarBalance = await getSuppliedBalance(api, HBAR_SIRIO_CONTRACT, HBAR_TOKEN_CONTRACT);
    api.add(HBAR_TOKEN_CONTRACT, hbarBalance[0]);

    const hsuiteBalance = await getSuppliedBalance(api, HSUITE_SIRIO_CONTRACT, HSUITE_TOKEN_CONTRACT);
    api.addToken(HSUITE_TOKEN_CONTRACT, hsuiteBalance[0])

    api.add(HSUITE_TOKEN_CONTRACT, hsuiteBalance[0]);
    // format to right token decimals
    api.addCGToken('HSUITE', hsuiteBalance[0] / 10 ** hsuiteBalance[1]);

    const packBalance = await getSuppliedBalance(api, PACK_SIRIO_CONTRACT, PACK_TOKEN_CONTRACT);
    api.add(PACK_TOKEN_CONTRACT, packBalance[0]);
}

module.exports = {
  methodology: "TVL on Sirio Finance",
  timetravel: false,
  hedera: { tvl }
};