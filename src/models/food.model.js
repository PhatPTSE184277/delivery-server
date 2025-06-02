const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FoodSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    restaurantId: {
      type: String,
      required: true,
      ref: 'Restaurant',
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    ingredients: {
      type: String,
      required: true,
      trim: true
    },
    available: {
      type: Boolean,
      default: true
    },
    popular: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

FoodSchema.index({ restaurantId: 1 });
FoodSchema.index({ category: 1 });
FoodSchema.index({ price: 1 });
FoodSchema.index({ popular: 1 });

const Food = mongoose.model('Food', FoodSchema);

module.exports = Food;