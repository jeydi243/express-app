const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/pharmatrack', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

//Export the model
module.exports = mongoose.model('User', new mongoose.Schema({
    login: {
        type: String,
        required: true,
    },
    pass: {
        type: String,
        required: true,
    },
    cardToUse: {
        type: String,
        required: true,
    },
    typeEtablissement: {
        type: String,
        required: true,
    },
    numAutorisation: {
        type: String,
        required: true,
    }
}));