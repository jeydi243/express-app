'use strict';
const namespace = "org.acme.airline.flight";
const transactionType = "CreateFlight";
const bnUtil = require('./bn-connection-util');
bnUtil.connect(main);

function main(error){
    
    // Check for error
    if(error){
        console.log(error);
        process.exit(1);
    }

    // 2. Get the Business Network Definition
    let bnDef =  bnUtil.connection.getBusinessNetwork();
    console.log("2. Received Definition from Runtime: ",
                   bnDef.getName(),"  ",bnDef.getVersion());

    // 3. Get the factory
    let factory = bnDef.getFactory();
    // 4. Create an instance of transaction
    let options = {
        generate: false,
        includeOptionalFields: false
    }
    let flightId = "AE101-05-06-2019";
    let transaction = factory.newTransaction(namespace,transactionType,flightId,options);

    // 5. Set up the properties of the transaction object
    transaction.setPropertyValue('flightNumber','AE101');
    transaction.setPropertyValue('origin', 'EWR');
    transaction.setPropertyValue('destination' , 'ATL');
    transaction.setPropertyValue('schedule' , new Date('2019-10-15T21:44Z'));

    // 6. Submit the transaction
    return bnUtil.connection.submitTransaction(transaction).then(()=>{
        console.log("6. Transaction Submitted/Processed Successfully!!")

        bnUtil.disconnect();

    }).catch((error)=>{
        console.log(error);

        bnUtil.disconnect();
    });
}