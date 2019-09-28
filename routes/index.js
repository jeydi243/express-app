var express = require('express');
var router = express.Router();
const bnUtil = require('../services/logic');
var BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
let participant = require('../services/db');
var crypto = require('crypto-random-string');

router.post('/Connexion', async function (req, res) {
    if (req.body.login == "admin" && req.body.password == "adminpw") {

        participant.findOne({
            login: req.body.login,
            pass: req.body.pass
        })
    } else {

    }

});

router.get('/AjouterUneIdentite', async function (req, res, next) {
    let obj = {
        typeEtablissement: "Pharmacien",
        idParticipant: '!5', //doit correspondre a l'id d'un participant
        identite: "samy",
        login: "samy",
        password: "123456789"
    }

    bnUtil.AjouterUneIdentite(obj).then((result) => {
        console.log("reussi: ", result);
        res.send(result.toString());
    }).catch((err) => {
        console.log("mororororooror" + err);
    });

});

router.post('/addPharmacien', async function (req, res, next) {
    //console.log("le corps d'une requete post est: " + req.body.numeroOrdre);
    let result = "resultat de l'operation"
    try {
        result = await bnUtil.AddPharmacien(req.body);
    } catch (error) {
        console.log(error);
    }
    console.log(result);

    res.send(result);
});
router.post('/addEtablissement', async function (req, res, next) {

    console.log("Données recus: ", req.body);
    let result = "operation echoué"
    try {
        result = await bnUtil.AddEtablissement(req.body);
    } catch (error) {
        console.log(error);
    }
    res.send(result);
});

router.get('/getEtablissements', async function (req, res, next) {
    let all = "vide";

    try {
        all = await bnUtil.getEtablissements(req.query.participant);
        console.log("Envoie de la liste des " + req.query.participant);
    } catch (error) {
        console.log(error);
    }
    res.send(all);
})

router.get('/Medicament', async function (req, res, next) {
    let Assets = {}
    try {
        //Assets = await bnUtil.getAssets(req.params.obj);
        Assets = await bnUtil.getAssets({
            typeAsset: "Medicament"
        });
        console.log("Envoie de la liste des " + req.params.obj.typeParticipant);

    } catch (error) {

    }
    res.send(Assets);
})

router.get('/BonCommande', async function (req, res, next) {
    let Assets = {};
    try {
        // Assets = await bnUtil.getAssets(req.params.obj);
        Assets = await bnUtil.getAssets({
            typeAsset: "BonCommande"
        });
        console.log("Envoie de la liste des " + req.params.obj.typeParticipant);
    } catch (error) {

    }
    res.send(Assets);
})

router.get('/BonLivraison', async function (req, res, next) {
    let Assets = {}
    try {
        // Assets = await bnUtil.getAssets(req.params.obj);
        Assets = await bnUtil.getAssets({
            typeAsset: "BonLivraison"
        });
        console.log("Envoie de la liste des " + req.params.obj.typeParticipant);
        res.send(Assets);

    } catch (error) {

    }
})

router.get('/ListeDesIdentites', async function (req, res) {
    let list = null
    try {
        list = await bnUtil.ListDesIdentites();
    } catch (error) {
        console.log(error);
    }
    res.send(list);
});

router.get('/f', async function (req, res) {
    let fd = "la chaine est vide si sa ne marche pas"
    try {
        fd = await bnUtil.existe();
    } catch (error) {
        console.log(error);
    }
    res.send(fd);
});

router.get('/test', async function (req, res) {
    let fd, epa = null
    let transaction  = "H";
    try {
        fd = await bnUtil.testConnection();
        //epa = await bnUtil.ListDesIdentites();
        //fd = await bnUtil.bitsecret2();
        //transaction = await bnUtil.testTransaction();
    } catch (error) {
        console.log(error);
    }
    console.log("Resultat transaction: ", fd)
    res.send(transaction);
});

router.post('/IsEtablissement', async function (req, res) {
    let result = false;
    console.log("IsEtablissement:-- ",req.body);
    try {
        result = await bnUtil.IsEtablissement(req.body);
    } catch (error) {
        console.log(error);
        
    }
    res.send(result);
});

router.post('/IsPharmacien', async function (req, res) {
    let result = false;
    try {
        result = await bnUtil.IsPharmacien(req.body.valeur);
    } catch (error) {
        console.log(error);
    }
    res.send(result);
});
router.get('/IsMedicamentOrLot', async function(req, res) {
    let bv = ""
    try {
        bv = await bnUtil.IsMedicamentOrLot(obj,user);
    } catch (error) {
        console.log(error);
    }
    res.send("Operation d'enregistrement");
});

module.exports = router;