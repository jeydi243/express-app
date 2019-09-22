'use strict';
const bnUtil = require('./bn-connection-util');

// #1 Connect to the airlinev8
bnUtil.cardName = 'admin@pharmatrack';
bnUtil.connect(main);

function main(error) {
    return bnUtil.connection.query('AllFlights').then((results) => {

        console.log('Received flight count:', results.length)

        var statement = 'SELECT  org.acme.airline.aircraft.Aircraft WHERE (aircraftId == _$id)';

        // #3 Build the query object
        return bnUtil.connection.buildQuery(statement);

    }).then((qry) => {
        return bnUtil.connection.query(qry, {
            id: 'CRAFT01'
        });
    }).then((result) => {
        console.log('Received aircraft count:', result.length);
        if (result.length > 0) console.log(result[0].aircraftId);
        bnUtil.connection.disconnect();
    }).catch((error) => {
        console.log(error);
        bnUtil.connection.disconnect();
    });
}