let express = require('express');
let app = express();
let port = process.env.PORT || 8080;
let morgan = require('morgan');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let router = express.Router();
let appRoutes = require('./app/routes/api')(router);
let path = require('path');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/api', appRoutes); // use '/api' in the path to differentiate between front end and backend routes

mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/SachinAppOneDb', { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
    if (err) {
        console.log('Not connected to the database: ' + err);
    }
    else {
        console.log('Successfully connected to MongoDB');
    }
});

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(port, function () {
    console.log('Running the server on port: ' + port);
});    
