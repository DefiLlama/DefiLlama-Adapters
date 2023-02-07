const sdk = require("@defillama/sdk");

async function tvl(){

    var responseData = {
        indexes: ["0x3527069C603b7d818aA0D3c15Bd4d8d5914aD66a","0xCE5a3270e5904260B7E4F4CC6e105401ce08788D","0xf4196172911E47074F8f601339438e4a50075153","0x3DC60aeC556FCC31E0f86be698550f439e367ECb","0x5A4957F97C2Ac01793C2aa1d06c6C9f6C20592b8","0x95bD9c6d2964A560B84788d55a8a135343E1129A","0x6d494a17f0D6001B20939e2C0dbF2b2Ea4F86393","0x7841988cA1A133eb30a156562d401B28b5cFaAbd","0xb4829a14A8F1097592D05e88F5c008baAcBF1077"],
        library: ["0x6ABb7648F1de0C96BbC4366B63185Be9Fa58A5c2","0x6ABb7648F1de0C96BbC4366B63185Be9Fa58A5c2","0xe66C5025bCDe4fc63e76D8b674b92B260dB7F32f","0x6ABb7648F1de0C96BbC4366B63185Be9Fa58A5c2","0x6ABb7648F1de0C96BbC4366B63185Be9Fa58A5c2","0xB89bcB6f9a34a40c3bB62085F4f1f94314A5769B","0x6ABb7648F1de0C96BbC4366B63185Be9Fa58A5c2","0xe66C5025bCDe4fc63e76D8b674b92B260dB7F32f","0xe66C5025bCDe4fc63e76D8b674b92B260dB7F32f"],
    } 

    var balances = {};
    var updatedBalance = {}
    for(let i=0;i<responseData.indexes.length;i++){
        
        var underlyingTokens = []
        var index = responseData.indexes[i]

        var indexVault = (await sdk.api.abi.call({
            abi : 'function vault() public view returns(address)',
            chain: 'bsc',
            target: index
        })).output

        var indexTokens = (await sdk.api.abi.call({
            abi : 'function getTokens() public view returns (address[] memory)',
            chain: 'bsc',
            target: index
        })).output

        const libraryContract = responseData.library[i];

        var tokenMetadata = (await sdk.api.abi.call({
            abi : 'function tokenMetadata() public view returns(address)',
            chain: 'bsc',
            target: libraryContract
        })).output

        var underlyingToken = (await sdk.api.abi.multiCall({
            abi: 'function vTokens(address) public view returns(address)',
            chain: 'bsc',
            calls: indexTokens.map((token)=>({
                target: tokenMetadata,
                params: token
            }))
        }))

        underlyingToken.output.map((uToken)=>{
            const outputAddress = uToken.output;
            const inputAddress = uToken.input.params[0];
            if(outputAddress != '0x0000000000000000000000000000000000000000'){
                underlyingTokens.push(outputAddress)
            }else{
                underlyingTokens.push(inputAddress)
            }
        })

        var vaultBalance = (await sdk.api.abi.multiCall({
            abi: 'erc20:balanceOf',
            chain: 'bsc',
            calls: underlyingTokens.map((token)=>({
                target: token,
                params: indexVault
            }))
        }))

        vaultBalance.output.map((bal)=>{
            const output = bal.output;
            const input = bal.input.target;
            sdk.util.sumSingleBalance(balances, input, output, 'bsc')
        })
        balances = updatedBalance;
    }    
    return balances
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    bsc: {tvl}
}