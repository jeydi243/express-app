const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
var IdentityIssue = require('composer-cli').Identity.Issue;
var CardImport = require('composer-cli').Card.Import;
const AdminConnection = require('composer-admin').AdminConnection;
const adminConnection = new AdminConnection();
const namespace = "pharmatrack";
var crypto = require('crypto-random-string');
let part = require('../services/db');


module.exports = {
    user: "admin@pharmatrack",
    AddEtablissement: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        let params = {}
        try {
            await businessNetworkConnection.connect("admin@pharmatrack");
            let etablissementRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + "." + obj.typeEtablissement);

            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();
            let etablissement = factory.newResource(namespace, obj.typeEtablissement, obj.numAutorisation);

            etablissement.nom = obj.nom;
            etablissement.adresse = obj.addresse;
            etablissement.login = obj.numAutorisation + "" + obj.nom;
            etablissement.password = crypto({
                length: 6,
                characters: '123456789'
            })

            let pharmacien = factory.newRelationship(namespace, "Pharmacien", obj.pharmacien); //obj.pharmacien doit etre l'identificateur du 

            etablissement.pharmaciengerant = pharmacien;
            await etablissementRegistry.add(etablissement);
            await businessNetworkConnection.disconnect();

            params = {
                numAutorisation: obj.numAutorisation,
                pharmacien: obj.pharmacien,
                typeEtablissement: obj.typeEtablissement
            }
            //on envoie le numero du pharmacien

        } catch (err) {
            console.log(err.stack);
        };
        
        this.AjouterUneIdentite(params).then((result) => {
            //console.log(result);
        }).catch((err) => {
            console.log(err.stack);
        });

    },
    AddPharmacien: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect("admin@pharmatrack");
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
            await businessNetworkConnection.connect(obj.cardToUse);
            let MedicamentRegistry = await businessNetworkConnection.getAssetRegistry(namespace + ".Medicament");
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            let Medicament = factory.newResource(namespace, 'Medicament', obj.code);
            //Medicament.code = "45"
            Medicament.nom = obj.nom;
            Medicament.description = obj.description;
            Medicament.datefab =  new Date(obj.dateFab)
            Medicament.dateExp =  new Date(obj.dateExp)
            Medicament.prixUnitaire = parseFloat(obj.prixUnitaire)

            let trace = factory.newConcept(namespace, 'Trace');
            //let proprio = factory.newRelationship(namespace, "Fabricant", obj.numAutorisation)

            trace.datetime = new Date();
            trace.proprio = factory.newRelationship(namespace, "Fabricant", obj.numAutorisation)

            var tb = []
            tb.push(trace)

            Medicament.trace = tb
            Medicament.proprio = factory.newRelationship(namespace, "Fabricant", obj.numAutorisation)

            await MedicamentRegistry.add(Medicament);
            await businessNetworkConnection.disconnect();
        } catch (error) {
            console.error(error.stack);
        }
    },
    AddBonCommande: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(obj.cardToUse);
            let BonCommandeRegistry = await businessNetworkConnection.getAssetRegistry(namespace + ".BonCommande");
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            let BonCommande = factory.newResource(namespace, 'BonCommande', obj.Id);
            tab = []
            obj.itemList.forEach(function(element){
                var e = factory.newConcept(namespace, 'itemList');
                e.qte = parseInt(element.qte);
                e.medicament = element.medoc
                tab.push(e);
            })
            
        
            BonCommande.medocs = tab
            BonCommande.emetteur =  factory.newRelationship(namespace, obj.typeEtablissement, obj.numAutorisation)
            BonCommande.destinataire = factory.newRelationship(namespace, obj.typeEtablissementDestinataire, obj.numAutorisation)

            await BonCommandeRegistry.add(BonCommande);
            await businessNetworkConnection.disconnect();

        } catch (error) {
            console.error(error.stack);
        }
    },
    AddBonLivraison: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(obj.currentUser.cardToUse);
            let BonLivraisonRegistry = await businessNetworkConnection.getAssetRegistry(namespace + ".BonLivraison");
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();
            let bonLivraison = factory.newResource(namespace, 'BonLivraison', obj.code);
            let my_array = []


            obj.codes.forEach(element => {
                let medicament = factory.newRelationship(namespace, 'Medicament', element);
                my_array.push(medicament)
            });


            bonLivraison.medocs = my_array;
            bonLivraison.destinataire = factory.newRelationship(namespace, obj.typeDestinataire, obj.destinataire);
            bonLivraison.emetteur = factory.newRelationship(namespace, obj.typeEtablissement, obj.numAutorisation);
            bonLivraison.bonCommande = factory.newRelationship(namespace, "BonCommande", obj.codeboncommande);

            await BonLivraisonRegistry.add(bonLivraison);
            await businessNetworkConnection.disconnect();

        } catch (error) {
            console.error(error);
        }
    },
    AjouterUneIdentite: async function (obj) {
        var pharmacien = ""
        var etablissement = " "

        try {
            pharmacien = await this.IsPharmacien(obj.pharmacien);
            etablissement = await this.IsEtablissement(obj);
            var participantid = "resource:pharmatrack." + obj.typeEtablissement + "#" + obj.numAutorisation
            var timestamp = new Date().getTime();

            var options = {
                card: "admin@pharmatrack",
                file: pharmacien.nom + "-" + pharmacien.numeroOrdre + "-" + timestamp,
                newUserId: pharmacien.nom + "-" + pharmacien.numeroOrdre + "-" + timestamp,
                participantId: participantid
            }
            IdentityIssue.handler(options).then(() => {
                CardImport.handler({
                    file: pharmacien.nom + "-" + pharmacien.numeroOrdre + "-" + timestamp + ".card",
                });
            }).catch((err) => {
                console.log(err.stack)
            });

            let user = new part();
            user.login = etablissement.login;
            user.pass  = etablissement.password
            user.typeEtablissement = obj.typeEtablissement;
            user.cardToUse = pharmacien.nom + "-" + pharmacien.numeroOrdre + "-" + timestamp + "@pharmatrack"
            user.numAutorisation = obj.numAutorisation;

            user.save(function (err, res) {
                if(!err) console.log("MONGO:",res);
                console.log(err);
            });
        } catch (error) {
            console.log(error.stack)
        }

    },
    testConnection: async function () {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect("dosseh-1-1569873168380");
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
            await businessNetworkConnection.connect("admin@pharmatrack");
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
            await businessNetworkConnection.connect(obj.cardToUse);
            let factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            let transaction = factory.newTransaction(namespace, "ConfirmerLivraison");
            let bonLivraison = factory.newRelationship(namespace, "BonLivraison", obj.BonLivraison);

            transaction.bonLivraison = bonLivraison;
            transaction.newproprio = newproprio;

            await businessNetworkConnection.submitTransaction(transaction);
            await businessNetworkConnection.disconnect();

        } catch (error) {
            console.log(error.stack);

        }
    },
    IsMedicament: async function (obj) {
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
            await businessNetworkConnection.connect(obj.cardToUse);
            let AssetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + "." + obj.typeAsset);
            let assets = await AssetRegistry.getAll();
            await businessNetworkConnection.disconnect();

            return assets;
        } catch (error) {
            console.log(error.stack);
        }
    },
    IsEtablissement: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect("admin@pharmatrack")
            let participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + "." + obj.typeEtablissement);
            let state = await participantRegistry.exists(obj.numAutorisation);

            if (state != false) {
                participant = await participantRegistry.get(obj.numAutorisation);
                await businessNetworkConnection.disconnect();
                return participant;
            } else {
                await businessNetworkConnection.disconnect();
                return false;
            }
        } catch (error) {
            console.log(error.stack);
        }

    },
    IsPharmacien: async function (valeur) {
        //console.log(valeur);
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect("admin@pharmatrack")
            let participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + ".Pharmacien");
            let state = await participantRegistry.exists(valeur);
            //console.log(state);
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
    IsBonCommande: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(obj.cardToUse)
            let bonCommandeRegistry = await businessNetworkConnection.getAssetRegistry(namespace + ".BonCommande");
            let state = await bonCommandeRegistry.exists(obj.code);

            if (state != false) {
                participant = await bonCommandeRegistry.get(obj.code);
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
    IsBonLivraison: async function (obj) {
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(obj.cardToUse)
            let bonLivraisonRegistry = await businessNetworkConnection.getAssetRegistry(namespace + ".BonLivraison");
            let state = await bonLivraisonRegistry.exists(obj.code);

            if (state != false) {
                bonLivraison = await bonLivraisonRegistry.get(obj.code);
                await businessNetworkConnection.disconnect();
                return bonLivraison;
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
        let med = null;
        try {
            await businessNetworkConnection.connect("admin@pharmatrack")
            let assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + ".Medicament");
            let state = await assetRegistry.exists(code);
            if (state != false) {
                //med = await assetRegistry.get(code);
                med = await assetRegistry.resolve(code);
                await businessNetworkConnection.disconnect();
                //return med.toJSON().trace;
                return med.trace;
            } else {
                await businessNetworkConnection.disconnect();
                return false;
            }
        } catch (error) {
            console.log(error.stack);
        }
    },
    resolve:async function (code) {
        var tab =[]
        var text1 = code.split(".");
        var text2 = text1[1];
        var ega = text2.split("#")
        let obj = {
            valeur: ega[1],
            type: ega[0]
        }

        let result = await this.IsEtablissement(obj);
        if (result != false) {
            return result.toJSON();
        } else {
            return false;
        }

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
    getEmetteurOfBonCommande: async function(obj){
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(obj.cardToUse);
            var query = businessNetworkConnection.buildQuery("SELECT pharmatrack.BonCommande WHERE (emetteur == _$code)");
            const assets = await businessNetworkConnection.query(query, { code: obj.numAutorisation })
            await businessNetworkConnection.disconnect();
            return assets;

        } catch (error) {
            console.log(error);
        } 
    },
    getEmetteurOfBonLivraison: async function(obj){
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(obj.cardToUse);
            var query = businessNetworkConnection.buildQuery("SELECT pharmatrack.BonLivraison WHERE (emetteur == _$code)");
            const assets = await businessNetworkConnection.query(query, { code: obj.numeroAutorisation})
            await businessNetworkConnection.disconnect();
            return assets;

        } catch (error) {
            console.log(error);
        } 
    },
    getDestinataireOfBonCommande: async function(obj){
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(obj.cardToUse);
            var query = businessNetworkConnection.buildQuery("SELECT pharmatrack.BonCommande WHERE (destinataire == _$code)");
            const assets = await businessNetworkConnection.query(query, { code: obj.numeroAutorisation })
            await businessNetworkConnection.disconnect();
            return assets;

        } catch (error) {
            console.log(error);
        } 
    },
    getDestinataireOfBonLivraison: async function(obj){
        let businessNetworkConnection = new BusinessNetworkConnection();
        try {
            await businessNetworkConnection.connect(obj.cardToUse);
            var query = businessNetworkConnection.buildQuery("SELECT pharmatrack.BonLivraison WHERE (destinataire == _$code)");
            const assets = await businessNetworkConnection.query(query, { code: obj.numeroAutorisation })
            await businessNetworkConnection.disconnect();
            return assets;

        } catch (error) {
            console.log(error);
        } 
    }
}