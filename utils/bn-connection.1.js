'use strict';

const FileSystemCardStore = require('composer-common').FileSystemCardStore;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
var cardName = "admin@airlinev7";
const   registryId = "org.acme.airline.aircraft.Aircraft";

const cardStore = new FileSystemCardStore();
const cardStoreObj = { cardStore: cardStore };
const bnConnection = new BusinessNetworkConnection(cardStoreObj);

// 3. Initiate a connection
return bnConnection.connect(cardName).then(function(){
    console.log("Connected Successfully!!!");

    getBusinessNetwork();
    // 5. Ping the network
    ping();

    // 6. Get all assets in a registry
    getAssets();

}).catch((error)=>{
    console.log(error);
});


// Extracts information about the network
function getBusinessNetwork(){
    // Returns an object of type BusinessNetworkDefinition
    let businessNetworkDefinition = bnConnection.getBusinessNetwork();
    // Dump package.json to the console
    console.log("Connected to: ",businessNetworkDefinition.metadata.packageJson.name,
                "  version ",businessNetworkDefinition.metadata.packageJson.version);
}

// Ping the network app
function ping(){
    bnConnection.ping().then(function(response){
        console.log("Ping Response:");
        console.log(response);
    });
}

// Get all the Asset from a registry Registry
// 1. Get an instance of the AssetRegistry
// 2. Get all he objects in the asset registry
function getAssets(){
    
    return bnConnection.getAssetRegistry(registryId).then(function(registry){
        console.log("Received the Registry Instance: ", registryId)

        // This would get a collection of assets
        return registry.getAll().then(function(resourceCollection){
            console.log("Received count=",resourceCollection.length)
        });

    }).catch(function(error){
        console.log(error);
    });
}

// function update