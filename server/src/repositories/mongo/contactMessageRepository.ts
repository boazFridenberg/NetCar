import { randomUUID } from 'crypto';
import { fromIContactMessage, toIContactMessage } from '../../db/mappers';
import { ContactMessageModel } from '../../db/models';
import { IContactMessage, IContactMessageInput } from '../../types';
import { IContactMessageRepository } from '../types';

export class MongoContactMessageRepository implements IContactMessageRepository {
  async create(input: IContactMessageInput, userId?: string): Promise<IContactMessage> {
    const now = new Date().toISOString();
    const msg: IContactMessage = {
      id: randomUUID(),
      userId,
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      category: input.category,
      subject: input.subject.trim(),
      body: input.body.trim(),
      read: false,
      createdAt: now,
    };
    const doc = await ContactMessageModel.create(fromIContactMessage(msg));
    return toIContactMessage(doc.toObject());
  }

  async list(): Promise<IContactMessage[]> {
    const docs = await ContactMessageModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(toIContactMessage);
  }

  async markRead(id: string, read: boolean): Promise<IContactMessage | null> {
    const doc = await ContactMessageModel.findByIdAndUpdate(
      id,
      { read },
      { new: true },
    ).lean();
    return doc ? toIContactMessage(doc) : null;
  }

  async countUnread(): Promise<number> {
    return ContactMessageModel.countDocuments({ read: false });
  }
}
