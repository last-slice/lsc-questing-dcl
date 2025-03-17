"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = apiRouter;
function apiRouter(router) {
    router.get('/api/:location/:action/:id', async (req, res) => {
        console.log('getting angzaar api router', req.params);
        if (!req.params || !req.params.location || !req.params.action || !req.params.id) {
            console.log('invalid parameters');
            res.status(200).send({ valid: false, message: "Invalid Parameters" });
            return;
        }
    });
}
