const express = require('express');
var path = require("path");
const app = express();

app.use(express.static(__dirname + "/"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/littlelifeupdate', (req, res) => {
    res.sendFile(path.join(__dirname, '/llu/index.html'));
});

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});