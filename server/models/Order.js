import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    items: [
      {
        id: { type: Number, required: true },
        title: { type: String, required: true },
        brand: { type: String, default: "" },
        thumbnail: { type: String, default: "" },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, default: 1 },
      },
    ],
    address: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Confirmed",
    },
  },
  {
    timestamps: true,
  }
)

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema)
export default Order
