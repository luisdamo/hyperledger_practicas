var indy = require('indy-sdk')
console.log(indy);
async function main() {
    const config = {"id": "jld"};
    const credentials = {"key": "Sindosa2022"};
    let walletHandler = 0;
    try{
        await indy.createWallet(config, credentials);
        walletHandler = await indy.openWallet(config, credentials);
        console.log(walletHandler);
    } catch (err) {
        console.error(err)
    }
    //Creamos nuestro DID
    let did,verkey;
    try {
        console.log("creando DID...")
        let [_did, _verkey] = await indy.createAndStoreMyDid(walletHandler, {})
        console.log("DID:" + _did)
        console.log("VERKEY" + _verkey)
        did = _did
        verkey = _verkey
    } catch (err) {
        console.error('Ha ocurrido un error al crear el DID:' + err)
        return
    }
    //Creamos nuestro SCHEMA
     let schemaId, schema;
      try {
          console.log("creando SCHEMA...")
          let [_id, _schema] = await indy.issuerCreateSchema(did,"SchemaPrueba", "1.0", ["name", "age"])
          console.log("SCHEMA id:" + _id)
          console.log("SCHEMA:" + JSON.stringify(_schema,null,4))
          id = _id
          schema = schema
      } catch (err) {
          console.error('Ha ocurrido un error al crear el SCHEMA:' + err)
          return
      }
}

(async () =>{
    await main();
})();
