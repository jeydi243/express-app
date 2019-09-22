var express = require('express');
var router = express.Router();
const bnUtil = require('../services/logic');
var BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
var connectionClient = new BusinessNetworkConnection();
let participant = require('../services/db');


router.post('/Connexion', async function (req, res) {
    console.log(req.body);
    res.send("respo");
    
});

router.get('/AjouterUneIdentite', async function (req, res, next) {

    await bnUtil.AjouterUneIdentite();


    let part = new participant();
    part.name = req.nom
    part.email = req.email
    part.mobile = req.mobile
    part.password = req.password
    part.save((err) => {
        res.send("MongoDB error: " + err);
    })
});

router.get('/IssueIdentity', function (req, res) {

    participant.find(function (error, Lesparticipants) {

        if (!error) {
            res.send("Le monde est beau " + Lesparticipants);
        } else {
            res.send("L'erreur est: " + error);
        }

    })
});

router.get('/Pharmacien', async function (req, res, next) {
    try {

    } catch (error) {
        console.log("epa: " + error);
    }
    res.send("fd");
});

router.get('/Etablissement', async function (req, res, next) {
    let participants = {}
    try {
        participants = await bnUtil.getEtablissement(req.params.obj);

        console.log("Envoie de la liste des " + req.params.obj.typeParticipant);
        res.send(participants);

    } catch (error) {

    }
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

module.exports = router;