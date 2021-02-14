const moongose = require('mongoose');

const Schema = moongose.Schema;

const orderSchema = new Schema({
    products: [{
        product: {
            type: Object,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    user: {
        name: {
            type: String,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            red: 'User',
            required: true
        }
    },
    date: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    }
});

module.exports = moongose.model('Order',orderSchema);