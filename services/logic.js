const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
var IdentityIssue = require('composer-cli').Identity.Issue;
var CardImport = require('composer-cli').Card.Import;
const AdminConnection = require('composer-admin').AdminConnection;
const adminConnection = new AdminConnection();
const namespace = "pharmatrack";
let part = require('../services/db');


module.exports = {
    user: "admin@pharmatrack",
    AddEtablissement: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        let params = {}
        try {
            await businessNetworkConnection.connect(this.user);
            let etablissementRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + "." + obj.typeEtablissement);

            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();
            let etablissement = factory.newResource(namespace, obj.typeEtablissement, obj.numAutorisation);

            etablissement.nom = obj.nom;
            etablissement.adresse = obj.addresse;

            let pharmacien = factory.newRelationship(namespace, "Pharmacien", obj.pharmacien); //obj.pharmacien doit etre l'identificateur du 

            etablissement.pharmaciengerant = pharmacien;
            await etablissementRegistry.add(etablissement);

            await businessNetworkConnection.disconnect();
            console.log("--!- Deconnexion -!--");

            params = {
                valeur: obj.numAutorisation,
                pharmacien: obj.pharmacien,
                type: obj.typeEtablissement
            }
            //on envoie le numero du pharmacien

        } catch (err) {
            console.log(err.stack);
        };
        console.log("     \n ++! Debut de l'enregistrement de l'identité !++ \n");
        this.AjouterUneIdentite(params).then((result) => {
            // console.log(params);
            // console.log(result);
        }).catch((err) => {
            console.log(err.stack);
            console.log("*** Erreur ***");
        });        

    },
    AddPharmacien: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(this.user);
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
    AddMedicament: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(this.user);
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
    AddBonCommande: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(this.user);
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
    AddBonLivraison: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(this.user);
            let BonLivraisonRegistry = await businessNetworkConnection.getAssetRegistry(namespace + ".BonLivraison");
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();
            let bonLivraison = factory.newResource(namespace, 'BonLivraison', obj.code);
            let my_array = []


            obj.codes.forEach(element => {
                let medicament = factory.newRelationship(namespace, 'Medicament', element);
                my_array.push(medicament)
            });

            
            bonLivraison.medocs = my_array;
            bonLivraison.destinataire = factory.newRelationship(namespace, obj.typeDestinataire,obj.destinataire);
            bonLivraison.emetteur = factory.newRelationship(namespace, obj.typeEmetteur,obj.obj.emetteur);
            bonLivraison.bonCommande = factory.newRelationship(namespace, "BonCommande", obj.boncommande);

            await BonLivraisonRegistry.add(bonLivraison);
            await businessNetworkConnection.disconnect();

        } catch (error) {
            console.error(error);
        }
    },
    AjouterUneIdentite: async function (obj) {
        var pharmacien = ""
        var etablissement = " "
        var mongoResult = ""
        
        try {
            pharmacien = await this.IsPharmacien(obj.pharmacien);
            etablissement = await this.IsEtablissement(obj);
            var participantid = "resource:pharmatrack." + obj.type + "#" + obj.valeur
            var timestamp = new Date().getTime();

            var options = {
                card: "admin@pharmatrack",
                file: pharmacien.nom + "-" + pharmacien.numeroOrdre+"-"+timestamp,
                newUserId: pharmacien.nom + "-" + pharmacien.numeroOrdre+"-"+timestamp,
                participantId: participantid
            }
            IdentityIssue.handler(options).then(() => {
                CardImport.handler({
                    file: pharmacien.nom + "-" + pharmacien.numeroOrdre+"-"+timestamp + ".card",
                });
            }).catch((err) => {
                console.log(err.stack)
            });
            
            let objet = Object.assign(obj,{cardToUse:pharmacien.nom + "-" + pharmacien.numeroOrdre+"-"+timestamp+"@pharmatrack"});
            mongoResult =  await this.addInmongo(objet);

        } catch (error) {
            console.log(error.stack)
        }
       
    },
    testConnection: async function () {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect("Odon-75321-1569628316497@pharmatrack");
            let result = await businessNetworkConnection.ping();
            console.log(`Participant = ${result.participant ? result.participant : '<pas de participant trouvé!>'}`);

            await businessNetworkConnection.disconnect();
            return result;

        } catch (error) {
            console.error(error);

        }
    },
    ListDesIdentites: async function () {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(this.user);
            let identityRegistry = await businessNetworkConnection.getIdentityRegistry();
            let identities = await identityRegistry.getAll();

            identities.forEach((identity) => {
                //console.log("-!- "+identity.toString());
                console.log(`identityId = ${identity.identityId}, id = ${identity.this.userID}, secret = ${identity.this.userSecret}, BusinessNetworkName = ${identity.BusinessNetworkName}`);
            });

            await businessNetworkConnection.disconnect();
            return identities;
        } catch (error) {
            console.log(error);
        }
    },
    ConfirmerBonLivraison: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(this.user);
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            let transaction = factory.newTransaction(namespace, "ConfirmerBonLivraison");
            let bonLivraison = factory.newRelationship(namespace, "BonLivraison", obj.BonLivraison);
            let oldproprio = factory.newRelationship(namespace, "EtablissementPharmaceutique", obj.proprio);

            let newproprio = null;

            transaction.sta = "LIVREE" // le status d'un Bon de commande
            transaction.bonlivraison = bonLivraison;
            transaction.newproprio = newproprio;

            // var newTrace = factory.newConcept(namespace, 'Trace');
            // newTrace.datetime = new Date();
            // newTrace.etablissement = newproprio;

            await businessNetworkConnection.submitTransaction(transaction);
            await businessNetworkConnection.disconnect();

        } catch (error) {
            console.log(error);

        }
    },
    IsMedicament:async function(obj){
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(obj.cardToUse)
            let participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + "." + obj.type);
            let state = await participantRegistry.exists(obj.valeur);
            if (state != false) {
                participant = await participantRegistry.get(obj.valeur);
                await businessNetworkConnection.disconnect();
                return participant;
            } else {
                await businessNetworkConnection.disconnect();
                return false;
            }
        } catch (error) {
            console.log(error);
        }
    },
    getEtablissements: async function (part) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect("admin@pharmatrack");
            let participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + "." + part);
            let participants = await participantRegistry.getAll();

            await businessNetworkConnection.disconnect();
            return participants;
        } catch (error) {
            console.log(error);
        }
    },
    getAssets: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(this.user);
            let AssetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + "." + obj.typeAsset);
            let assets = await AssetRegistry.getAll();

            await businessNetworkConnection.disconnect();
            return assets;
        } catch (error) {
            console.log(error);
        }
    },
    existe: async function () {
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
    IsEtablissement: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect("admin@pharmatrack")
            let participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + "." + obj.type);
            let state = await participantRegistry.exists(obj.valeur);
            if (state != false) {
                participant = await participantRegistry.get(obj.valeur);
                await businessNetworkConnection.disconnect();
                return participant;
            } else {
                await businessNetworkConnection.disconnect();
                return false;
            }
        } catch (error) {
            console.log(error);
        }

    },
    IsPharmacien: async function (valeur) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect("admin@pharmatrack")
            let participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + ".Pharmacien");
            let state = await participantRegistry.exists(valeur);
            if (state != false) {
                participant = await participantRegistry.get(valeur);
                await businessNetworkConnection.disconnect();
                return participant;
            } else {
                await businessNetworkConnection.disconnect();
                return false;
            }
        } catch (error) {
            console.log(error);
        }

    },
    IsBoncommande: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(obj.cardToUse)
            let participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + ".BonCommande");
            let state = await participantRegistry.exists(obj.valeur);

            if (state != false) {
                participant = await participantRegistry.get(obj.valeur);
                await businessNetworkConnection.disconnect();
                return participant;
            } else {
                await businessNetworkConnection.disconnect();
                return false;
            }
        } catch (error) {
            console.log(error);
        }

    },
    getTrace: async function (code) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(this.user);
            let AssetRegistry = await businessNetworkConnection.getAssetRegistry("pharmatrack.Medicament");
            let medicament = await AssetRegistry.get(code); //code d'un medicament

            return medicament.trace;
        } catch (error) {
            console.log(error);
        }
        return false;
    },
    testTransaction: async function () {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(this.user);
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();
            let transaction = factory.newTransaction(namespace, "setup");

            transaction.proprio = factory.newRelationship(namespace, "Fabricant", "9721");

            let text = await businessNetworkConnection.submitTransaction(transaction);
            await businessNetworkConnection.disconnect();
            return text;

        } catch (error) {
            console.log(error);
        }
    },
    addInmongo: async function (obj) {
        let user = new part();
        try {
            var pharmacien = await this.IsPharmacien(obj.pharmacien);
            user.nom = pharmacien.nom
            user.email = pharmacien.email
            user.numeroOrdre = pharmacien.numeroOrdre
            user.login = pharmacien.login;
            user.password = pharmacien.password
            user.typeEtablissement = obj.type;
            user.cardToUse = obj.cardToUse
            user.save(function(err,res){
                console.log(res);
            });
        } catch (error) {
            console.log(error.stack);
        }
        
    }
}