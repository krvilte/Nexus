import { Schema, model } from "mongoose";
const subscriptionSchena = new Schema(
  {
    subcsruber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELED"],
      default: "ACTIVE",
    },
    subscribedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

const Subscription = model("Subscription", subscriptionSchena);
export default Subscription;
