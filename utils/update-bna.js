'use strict';
const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;

const cardNameForPeerAdmin = "PeerAdmin@hlfv1";
const appName = "airlinev7";
// This where I have the archive file for v2.0 of airlinev7
// CHANGE THIS DIRECTORY FOR YOUR Model Project
const bnaDirectory = "/AIRLINE v7 Poroject Folder/";

// 1. Create the AdminConnection instance
// Composer 0.19.0 change
var walletType = { type: 'composer-wallet-filesystem' }
const adminConnection = new AdminConnection(walletType);

// 2. Connect using the card for the Network Admin
return adminConnection.connect(cardNameForPeerAdmin).then(function(){
    console.log("Admin Connection Successful!!!");

    // Upgrade the BNA version
    upgradeApp();
}).catch(function(error){
    console.log(error);
});

/**
 * Deploys a network app using the admin connection
 */
function upgradeApp(){
    var bnaDef = {}
    BusinessNetworkDefinition.fromDirectory(bnaDirectory).then(function(definition){
        bnaDef = definition;
        console.log("Successfully created the definition!!! ",bnaDef.getName())

        // Install the new version of the BNA
        return adminConnection.install(bnaDef);
        
    }).then(()=>{

        // 4. Update the application
        // If you do not have the app installed, you will get an error
        console.log("Install successful")
        return adminConnection.upgrade(appName, '0.0.2');

    }).then(()=>{

        console.log('App updated successfully!! ', bnaDef.getName(),'  ',bnaDef.getVersion());
        adminConnection.disconnect();

    }).catch(function(error){
        console.log(error);
    });

}

