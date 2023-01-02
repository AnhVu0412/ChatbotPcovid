import express from 'express';
import bodyParser from 'body-parser';
import viewEngine from './configs/viewEngine';
import webRoutes from './routes/web';
import chatbotService from './services/chatbotService';

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//config view engine
viewEngine(app);

//config web Route
webRoutes(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})