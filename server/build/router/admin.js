"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = adminRouter;
const cache_1 = require("../utils/cache");
const initializer_1 = require("../utils/initializer");
function adminRouter(router) {
    router.post('/admin/:auth', authentication, (req, res) => {
        console.log('admin router - ', req.body);
        if (!req.body) {
            res.status(200).send({ valid: false });
            return;
        }
        switch (req.body.type) {
            default:
                return res.status(200).send({ valid: true, message: "unavailable route" });
        }
    });
    router.get('/admin/:data/:auth', authentication, (req, res) => {
        console.log('admin data router - ', req.params.data, req.params.auth);
        res.status(200).send({ valid: true, [req.params.data]: (0, cache_1.getCache)(req.params.data) });
    });
    router.get('/admin/clear/:data/:auth', authentication, (req, res) => {
        console.log('admin data router - ', req.params.data, req.params.auth);
        let file;
        let data;
        switch (req.params.data) {
            case 'profiles':
                file = initializer_1.PROFILES_FILE;
                data = [];
                break;
        }
        (0, cache_1.updateCache)(file, req.params.data, data);
        res.status(200).send({ valid: true, [req.params.data]: (0, cache_1.getCache)(req.params.data) });
    });
}
function authentication(req, res, next) {
    if (!req.params.auth || req.params.auth !== process.env.ADMIN_AUTH) {
        res.status(400).send({ valid: false, message: "Invalid authorization" });
        return;
    }
    next();
}
