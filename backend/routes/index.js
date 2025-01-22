const express = require('express');
const Router = express.Router();

const userRouter = require('./user.route');


const routes = [
    {
        path: '/profile',
        router: userRouter
    }

    //Rest of the routes goes here..
];

routes.forEach((routeObject) => {
    Router.use(routeObject.path, routeObject.router);
});

module.exports = Router;