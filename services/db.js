const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/pharmatrack', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

//Export the model
module.exports = mongoose.model('Participant', new mongoose.Schema({
    login: {
        type: String,
        required: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        unique: true,
    },
    identite: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
}));