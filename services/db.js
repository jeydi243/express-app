const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/pharmatrack', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

//Export the model
module.exports = mongoose.model('User', new mongoose.Schema({
    nom: {
        type: String,
        required:true
    },
    numeroOrdre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    login: {
        type: String,
        required: true,
        index: true,
    },
    pass: {
        type: String,
        required: true,
        unique: true,
    },
    cardToUse: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    typeEtablissement: {
        type: String,
        required: true,
    }
}));