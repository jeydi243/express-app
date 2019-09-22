/* eslint-disable */ 

const AdminConnection = require('composer-admin').AdminConnection;
const cardNameForPeerAdmin = "PeerAdmin@hlfv1";
const cardNameForNetworAdmin = "admin@pharmatrack";
const appToBePinged = "pharmatrack";

const wallletType = {
    type: "composer-wallet-filesystem"
}
const adminConnection = new AdminConnection();

return adminConnection.connect(cardNameForPeerAdmin).then(() => {

    console.log("Admin connected Successfully");
    listBusinessNetwork();

}).catch((err) => {

    console.log(err);

});

function listBusinessNetwork() {
    adminConnection.list().then((networks) => {

        console.log("Récupération réussie de tous les réseaux déployés: ", networks);
        networks.forEach(BusinessNetwork => {
            console.log("deployed businessNetwork", BusinessNetwork);
        });
        adminConnection.disconnect();
        reconnectAsNetworkAdmin();

    }).catch((err) => {
        console.log(err);
    });
}

function reconnectAsNetworkAdmin() {
    return adminConnection.connect(cardNameForNetworAdmin).then(() => {
        console.log("L'administrateur du reseau s'est connecté");
        adminConnection.ping(appToBePinged).then((response) => {
            console.log("Reponse du ping pour le reseau ",appToBePinged,":", response);
            adminConnection.disconnect();
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });
}