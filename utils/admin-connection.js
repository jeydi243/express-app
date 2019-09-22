'use strict';
const AdminConnection = require('composer-admin').AdminConnection;
const cardNameForPeerAdmin   = "PeerAdmin@hlfv1";
const cardNameForNetworkAdmin   = "admin@pharmatrack";
const appToBePinged = "pharmatrack";
var walletType = { type: 'composer-wallet-filesystem' }
var adminConnection = new AdminConnection(walletType);

return adminConnection.connect(cardNameForPeerAdmin).then(function(){
    console.log("Admin Connected Successfully!!!");
    listBusinessNetwork();
}).catch((error)=>{
    console.log(error);
});


function listBusinessNetwork(){
    adminConnection.list().then((networks)=>{
        console.log("1. Successfully retrieved the deployed Networks: ",networks);

        networks.forEach((businessNetwork) => {
            console.log('Business Network deployed in Runtime', businessNetwork);
         });    

        return adminConnection.disconnect().then(function(){
            reconnectAsNetworkAdmin();
        });

        
    }).catch((error)=>{
        console.log("Error=",error);
    });
}

function reconnectAsNetworkAdmin(){
    return adminConnection.connect(cardNameForNetworkAdmin).then(function(error){
        
        console.log("2. Network Admin Connected Successfully!!!");
        
        adminConnection.ping(appToBePinged).then(function(response){
            console.log("Ping response from "+appToBePinged+" :",response);
            adminConnection.disconnect();
        }).catch((error)=>{
            console.log("Error=",error);
        });

    });

    
}


