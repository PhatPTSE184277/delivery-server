const { VerifyToken } = require('../middlewares/verifyToken');
const AuthRouter = require('./authentication.route');
const UserRouter = require('./user.route');

module.exports = (app) => {
    app.use('/auth', AuthRouter);
     app.use(VerifyToken);
    app.use('/user', UserRouter);
}