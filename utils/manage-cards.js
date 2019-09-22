'use strict';

const NetworkCardStoreManager= require('composer-common').NetworkCardStoreManager;
var walletType = { type: 'composer-wallet-filesystem' }
const cardStore = NetworkCardStoreManager.getCardStore( walletType );


return cardStore.getAll().then(function(cardMap){
    console.log(cardMap.keys());
    let firstCard = cardMap.keys().next().value
    return cardStore.get(firstCard);

}).then(function(idCard){
    console.log("Pulled First Card from file system: ", idCard.getUserName(),' @ ', idCard.getBusinessNetworkName())
    console.log("Connection Profile Name: ",idCard.getConnectionProfile().name)
    
}).catch((error)=>{
    console.log(error)
});




