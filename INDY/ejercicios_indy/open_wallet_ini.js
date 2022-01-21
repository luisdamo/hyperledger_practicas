var indy = require('indy-sdk')

async function main() {
    const config = {"id": "jld"};
    const credentials = {"key": "Sindosa2022"};
    let walletHandler;
    try{
        await indy.createWallet(config, credentials);
        walletHandler = await indy.openWallet(config, credentials);
        console.log(walletHandler);
    } catch (err) {
        console.error(err)
    }
}

(async () =>{
    await main();
})();