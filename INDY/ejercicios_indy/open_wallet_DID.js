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
    //let did, verkey;
    try {
        console.log("creando DID...")
        const [did, verkey] = await indy.createAndStoreMyDid(walletHandler, {})
        console.log("DID:" + did)
        console.log("VERKEY" + verkey)
    } catch (err) {
        console.error('Ha ocurrido un error al crear el DID: $(err)')
    }
}

(async () =>{
    await main();
})();