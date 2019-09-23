const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
//const cli = require('composer-cli').create;
const namespace = "pharmatrack";
let participant = require('../services/db');



module.exports = {
    AddEtablissement: async function (obj, user = "admin@pharmatrack") {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            let etablissementRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + "." + obj.typeEtablissement);
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();
            let etablissement = factory.newResource(namespace, obj.typeEtablissement, obj.numAutorisation);


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
        console.log("le mondeE: " + obj.numeroOrdre);
        try {
            await businessNetworkConnection.connect(user);
            let participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + ".Pharmacien");
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            let participant = factory.newResource(namespace, 'Pharmacien', obj.numeroOrdre);


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
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();
            let parti = factory.newRelationship(namespace, "Pharmacien", obj.idParticipant);
            let result = await businessNetworkConnection.issueIdentity(parti, obj.identite)

            let part = new participant();
            part.login = obj.login
            part.password = obj.password
            part.identite = result.identityID
            part.save((err) => {
                res.send("Impossible d'ajouter une identité: " + err);
            })
            await businessNetworkConnection.disconnect();
            return result;

        } catch (error) {
            console.log(error);
        }
    },
    testConnection: async function (user = "admin@pharmatrack") {
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
    ListDesIdentites: async function (user = "admin@pharmatrack") {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            let identityRegistry = await businessNetworkConnection.getIdentityRegistry();
            let identities = await identityRegistry.getAll();

            identities.forEach((identity) => {
                //console.log("-!- "+identity.toString());
                console.log(`identityId = ${identity.identityId}, id = ${identity.userID}, secret = ${identity.userSecret}, BusinessNetworkName = ${identity.BusinessNetworkName}`);
            });

            await businessNetworkConnection.disconnect();
            return identities;
        } catch (error) {
            console.log(error);
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
    getEtablissements: async function (part, user = "admin@pharmatrack") {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            let participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + "." + part);
            let participants = await participantRegistry.getAll();

            await businessNetworkConnection.disconnect();
            return participants;
        } catch (error) {
            console.log(error);
        }
    },
    getAssets: async function (obj, user = "admin@pharmatrack") {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            let AssetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + "." + obj.typeAsset);
            let assets = await AssetRegistry.getAll();

            await businessNetworkConnection.disconnect();
            return assets;
        } catch (error) {
            console.log(error);
        }
    },
    existe: async function (user = "admin@pharmatrack") {
        let obj = {
            login: "epa",
            pass: "123456789"
        }
        participant.findOne({
            login: obj.login,
            password: obj.pass
        }, function (err, participant) {
            if (!err) console.log(participant);
            console.log(err);
        });

    },
    IsGrossiste: async function (valeur, user = "admin@pharmatrack") {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            const query = connection.buildQuery('SELECT pharmatrack.Grossiste WHERE (numeroAutorisation == _$inputValue)');
            const asset = await connection.query(query, {
                inputValue: valeur
            });
            if(assets.length == 1){
                return true;
            }else{
                return false;
            }
        } catch (error) {
            console.log(error);
        }

    },
    IsPharmacien: async function (valeur,user = "admin@pharmatrack") {let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            const query = connection.buildQuery('SELECT pharmatrack.Pharmacien WHERE (numeroAutorisation == _$inputValue)');
            const assets = await connection.query(query, {
                inputValue: valeur
            });
            if(assets.length == 1){
                return true;
            }else{
                return false;
            }
        } catch (error) {
            console.log(error);
        }},
    IsFabricant: async function (valeur, user = "admin@pharmatrack") {let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            const query = connection.buildQuery('SELECT pharmatrack.Fabricant WHERE (numeroAutorisation == _$inputValue)');
            const assets = await connection.query(query, {
                inputValue: valeur
            });
            if(assets.length == 1){
                return true;
            }else{
                return false;
            }
        } catch (error) {
            console.log(error);
        }},
    IsPharmacie: async function (valeur, user = "admin@pharmatrack") {let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(user);
            const query = connection.buildQuery('SELECT pharmatrack.Pharmacie WHERE (numeroAutorisation == _$inputValue)');
            const asset = await connection.query(query, {
                inputValue: valeur
            });
            if(assets.length == 1){
                return true;
            }else{
                return false;
            }
        } catch (error) {
            console.log(error);
        }}
}