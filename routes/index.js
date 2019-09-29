var express = require('express');
var router = express.Router();
const bnUtil = require('../services/logic');
var BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
let User = require('../services/db');
var crypto = require('crypto-random-string');

/**RETIENT UNE REQUETE GET:  req.query */


router.get('/Connexion',(req, res) => {
    let response = ""

    if (req.query.login == "admin" && req.query.pass == "adminpw") {
        res.send({cardToUse: "admin@pharmatrack", typeEtablissement: "admin"});
    } else {
        User.findOne({
            login: req.query.login,
            pass: req.query.pass
        },function (err, user) {
            if(!err){
                response = {cardToUse: user.cardToUse, typeEtablissement: user.typeEtablissement}
            }else{
                console.log(err);
            }
        });
    }
    res.send(response);

})

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
        console.log(error.stack);
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

router.post('/AddBonLivraison', (req, res) => {
    let result;
    try {
        result = bnUtil.AddBonLivraison(Object.assign(req.body,req.query));
    } catch (error) {
        
    } 
    res.send(1);
});
router.post('/AddBonCommande', (req, res) => {

    res.send(1);
});

router.get('/ListeDesIdentites', async function (req, res) {
    let list = null
    try {
        list = await bnUtil.ListDesIdentites();
    } catch (error) {
        console.log(error);
    }
    res.send(list);
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

router.get('/IsMedicament', async function(req, res) {
    let bv = ""
    try {
        bv = await bnUtil.IsMedicament(obj);
    } catch (error) {
        console.log(error);
    }
    res.send("Operation d'enregistrement");
});

router.get('/find', (req, res) => {
    let resultat =""
    User.find({},"nom email login").exec((err,docs)=>{
        console.log(docs);
        resultat = docs
    });

    res.send(resultat);
});

router.get('/getCrypto', (req, res) => {
    res.send(crypto({length:7,type: 'base64'}));
});

router.get('/inte', (req, res) => {
    console.log("Get systeme: ",req.query.cardToUse);
    res.send("getRequest");
});

router.post('/inte', (req, res) => {
    console.log("Post systeme: ",req.query.cardToUse);
    res.send("postRequest");
});


module.exports = router;