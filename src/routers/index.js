const { VerifyToken } = require('../middlewares/verifyToken');
const AuthRouter = require('./authentication.route');
const UserRouter = require('./user.route');
const RestaurantRouter = require('./restaurant.route');
const CartRouter = require('./cart.route');
const FoodRouter = require('./food.route');
const BookMarkRoute = require('./bookmark.route');
const AddressRouter = require('./address.route');
const OrderRouter = require('./order.route');

module.exports = (app) => {
    app.use('/auth', AuthRouter);
    app.use('/user', VerifyToken, UserRouter);
    app.use('/restaurant', VerifyToken, RestaurantRouter);
    app.use('/cart', VerifyToken, CartRouter);
    app.use('/food', VerifyToken, FoodRouter);
    app.use('/bookmark', VerifyToken, BookMarkRoute);
    app.use('/address', VerifyToken, AddressRouter);
    app.use('/order', VerifyToken, OrderRouter);
}