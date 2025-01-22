const app = require('./app');
require('dotenv').config()

const port = process.env.port || 5000;


app.listen(port, () => {
    console.log(`The server is running on http://localhost:${port}`)
})