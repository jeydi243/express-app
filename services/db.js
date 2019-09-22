const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/pharmatrack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

var participant = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    password:{
        type:String,
        required:true,
        index:true,
    },
});

//Export the model
module.exports = mongoose.model('Participant', participant);