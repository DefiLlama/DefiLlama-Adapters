const XAUE_PROXY = "0xd5D6840ed95F58FAf537865DcA15D5f99195F87a";
const ORACLE_PROXY = "0x0618BD112C396060d2b37B537b3d92e757644169";
const XAUt = "0x68749665FF8D2d112Fa859AA293F07A622782F38";

async function tvl(api) {
    const totalSupply = (await api.call({
        target: XAUE_PROXY,
        abi: "erc20:totalSupply",
    }));
    const oraclePrice = (await api.call({
        target: ORACLE_PROXY,
        abi: "uint256:getLatestPrice",
    }));
    let balance = totalSupply * oraclePrice / 1e30;
    api.add(XAUt, balance);
}

module.exports = {
    methodology: 'TVL is derived from XAUE outstanding supply and the latest on-chain NAV oracle price. This uses implied TVL / supply-based TVL rather than vault-balance-only TVL, because underlying XAUt may be held in custody addresses outside the on-chain vault.',
    ethereum: {
        tvl,
    },
};
