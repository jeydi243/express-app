const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const namespace = "pharmatrack";

module.exports = {
    AddEtablissement: async function (obj, user = "admin@pharmatrack") {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            let etablissementRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + "."+ obj.typeEtablissement);
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();
            let etablissement = factory.newResource(namespace, obj.type, obj.numAutorisation);


            let adresse = factory.newConcept(namespace, 'Adresse');

            adresse.ville = obj.adresse.ville;
            adresse.province = obj.adresse.province;
            adresse.avenue = obj.adresse.avenue;
            adresse.numero = obj.adresse.numero;


            etablissement.nom = obj.nom;
            etablissement.adresse = adresse;

            let pharmacien = factory.newRelationship(namespace, "Pharmacien", obj.pharmacien); //obj.pharmacien doit etre l'identificateur du 

            etablissement.pharmaciengerant = pharmacien;
            etablissement.login = obj.login;
            etablissement.pass = obj.pass;


            await etablissementRegistry.add(etablissement);
            await businessNetworkConnection.disconnect();
        } catch (error) {
            console.error(error);
        }
    },
    AddPharmacien: async function (obj, user = "admin@pharmatrack") {
        let businessNetworkConnection = new BusinessNetworkConnection();
        console.log("le mondeE: "+obj.numOrdre.toString());
        try {
            await businessNetworkConnection.connect(user);
            let participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + ".Pharmacien");
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            let participant = factory.newResource(namespace, 'Pharmacien', obj.numOrdre);
            

            participant.nom = obj.nom;
            participant.email = obj.email;

            await participantRegistry.add(participant);
            await businessNetworkConnection.disconnect();
        } catch (error) {
            console.error(error);
        }
    },
    AddMedicament: async function (obj, user = "admin@pharmatrack") {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            let MedicamentRegistry = await businessNetworkConnection.getAssetRegistry(namespace + ".Medicament");
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            let Medicament = factory.newResource(namespace, 'Medicament', obj.code);

            Medicament.nom = obj.nom;
            Medicament.description = obj.description;
            Medicament.dateFab = obj.dateFab;
            Medicament.dateExp = obj.dateExp;
            Medicament.prixUnitaire = obj.prixUnitaire;

            let trace = factory.newConcept(namespace, 'Trace');
            //code qui sera necessaire a l'ajout d'une trace
            /*trace.datetime = obj.trace.datetime;
            trace.proprio = factory.newRelationship(namespace, "Fabricant" ,obj.trace.proprio)*/
            

            Medicament.trace = trace;
            Medicament.lot = obj.lot;

            let proprio = factory.newRelationship(namespace, "Fabricant", obj.fabricant); // obj.fabricant doit correspondre a l'identité du fabricant(n)
            Medicament.proprio = proprio;

            await MedicamentRegistry.add(Medicament);
            await businessNetworkConnection.disconnect();
        } catch (error) {
            console.error(error);
        }
    },
    AjouterUneIdentite: async function (obj, user = "admin@pharmatrack") {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {

            await businessNetworkConnection.connect(user);
            let result = await businessNetworkConnection.issueIdentity("pharmatrack." + obj.typeEtablissement + "#" + obj.name, obj.identite)

            //console.log(`userID = ${result.userID}`);
            //console.log(`userSecret = ${result.userSecret}`);
            await businessNetworkConnection.disconnect();
            return result;

        } catch (error) {
            console.log(error);
        }
    },
    testConnection: async function (obj, user = "admin@pharmatrack") {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            let result = await businessNetworkConnection.ping();
            console.log(`participant = ${result.participant ? result.participant : '<pas de participant trouvé!>'}`);
            await businessNetworkConnection.disconnect();
        } catch (error) {
            console.error(error);

        }
    },
    ListDesIdentites: async function (obj, user = "admin@pharmatrack") {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            let identityRegistry = await businessNetworkConnection.getIdentityRegistry();
            let identities = await identityRegistry.getAll();

            identities.forEach((identity) => {
                console.log(`identityId = ${identity.identityId}, name = ${identity.name}, state = ${identity.state}`);
            });

            await businessNetworkConnection.disconnect();
            return identities;
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    },
    ConfirmerBonLivraison: async function (obj, user = "admin@pharmatrack") {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            let transaction = factory.newTransaction(namespace, "ConfirmerBonLivraison");
            let bonLivraison = factory.newRelationship(namespace, "BonLivraison", obj.BonLivraison);
            let oldproprio = factory.newRelationship(namespace, "EtablissementPharmaceutique", obj.proprio);
            let identityRegistry = await businessNetworkConnection.getIdentityRegistry();
            let newproprio = null;

            transaction.sta = "LIVREE" // le status d'un Bon de commande
            transaction.bonlivraison = bonLivraison;
            transaction.oldproprio = oldproprio;
            transaction.newproprio = newproprio;

            bonLivraison.medocs.forEach(medicament => {
                medicament.proprio = newproprio;
            });

            businessNetworkConnection.submitTransaction(transaction);
            await businessNetworkConnection.disconnect();

        } catch (error) {
            console.log(error);

        }
    },
    getEtablissement: async function(obj, user = "admin@pharmatrack"){
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            let participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace+"."+obj.typeParticipant);
            let participants = await participantRegistry.getAll();

            await businessNetworkConnection.disconnect();
            return participants;
        } catch (error) {
            console.log(error);
        }
    },
    getAssets: async function (obj, user = "admin@pharmatrack"){
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            let AssetRegistry = await businessNetworkConnection.getAssetRegistry(namespace+"."+obj.typeAsset);
            let assets = await AssetRegistry.getAll();

            await businessNetworkConnection.disconnect();
            return assets;
        } catch (error) {
            console.log(error);
        }
    }
}