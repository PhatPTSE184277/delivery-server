const { VerifyToken } = require('../middlewares/verifyToken');
const AuthRouter = require('./authentication.route');
const UserRouter = require('./user.route');
const RestaurantRouter = require('./restaurant.route');
const CartRouter = require('./cart.route');
const FoodRouter = require('./food.route');
const BookMarkRoute = require('./bookmark.route');

module.exports = (app) => {
    app.use('/auth', AuthRouter);
    app.use(VerifyToken);
    app.use('/user', UserRouter);
    app.use('/restaurant', RestaurantRouter);
    app.use('/cart', CartRouter);
    app.use('/food', FoodRouter);
    app.use('/bookmark', BookMarkRoute)
}