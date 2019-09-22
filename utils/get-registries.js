'use strict';
const bnUtil = require('./bn-connection-util');
bnUtil.connect(main);

function main(error){
    // Check for the connection error
    if(error){
        console.log(error);
        process.exit(1);
    }

    // 2. Get All asset registries...arg true = include system registry
    bnUtil.connection.getAllAssetRegistries(false).then((registries)=>{        
        console.log("Registries");
        console.log("==========");
        printRegistry(registries);
        // 3. Get all the participant registries
        return bnUtil.connection.getAllParticipantRegistries(false);
    }).then((registries)=>{
        printRegistry(registries);

        // 4. Get all the transaction Registries
        return bnUtil.connection.getAllTransactionRegistries();
    }).then((registries)=>{       
        printRegistry(registries);

        // 5. Get the Historian Registry
        return bnUtil.connection.getHistorian();

    }).then((registry)=>{
        console.log("Historian Registry: ", registry.registryType, "   ", registry.id);

        // 6. Get the Identity Registry
        return bnUtil.connection.getIdentityRegistry();

    }).then((registry)=>{
        console.log("Identity Registry: ", registry.registryType, "   ", registry.id);

        bnUtil.connection.disconnect();
    }).catch((error)=>{
        console.log(error);
        bnUtil.connection.disconnect();
    });
}

// Utility function to print information about the registry
function printRegistry(registryArray){
    registryArray.forEach((registry)=>{
        console.log(registry.registryType, "   ", registry.id);
    });
}
