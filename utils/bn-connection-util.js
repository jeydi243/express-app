/* eslint-disable */ 

module.exports = {
    cardStore: require('composer-common').FileSystemCardStore,
    BusinessNetworkConnection: require('composer-client').BusinessNetworkConnection,
    cardName: 'admin@pharmatrack',
    connection: {},

    connect: function (callback) {
        var cardtype = {type: 'composer-wallet-filesystem'}
        this.connection = new this.BusinessNetworkConnection(cardtype);

        return this.connection.connect(this.cardName).then(() => {
            callback();
        }).catch((err) => {
            callback(err);
        });
    },
    disconnect: function (callback) {
        this.connection.disconnect();
    },
    ping: function (callback) {
        return this.connection.ping().then((response) => {
            callback(response)
        }).catch((err) => {
            callback({}, err);
        });
    }
}
