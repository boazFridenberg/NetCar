import { Schema, model, models, type InferSchemaType } from 'mongoose';

const ContactMessageSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    category: {
      type: String,
      enum: ['bug', 'question', 'feedback', 'other'],
      required: true,
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false, index: true },
    createdAt: { type: String, required: true, index: true },
  },
  {
    _id: false,
    versionKey: false,
    collection: 'contact_messages',
  },
);

ContactMessageSchema.index({ read: 1, createdAt: -1 });

export type ContactMessageDoc = InferSchemaType<typeof ContactMessageSchema> & { _id: string };

export const ContactMessageModel =
  models.ContactMessage ?? model<ContactMessageDoc>('ContactMessage', ContactMessageSchema);
