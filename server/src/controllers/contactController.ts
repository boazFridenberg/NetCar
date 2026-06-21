
import { Request, Response } from 'express';
import { contactMessageRepository } from '../repositories';
import { contactMessageSchema } from '../validators/schemas';
import { ok } from '../utils/respond';

export async function submitContact(req: Request, res: Response): Promise<void> {
  const dto = contactMessageSchema.parse(req.body);
  const userId = req.user?.sub;

  const message = await contactMessageRepository.create(dto, userId);

  ok(res, {
    message: 'ההודעה נשלחה בהצלחה. נחזור אליך בהקדם האפשרי.',
    id: message.id,
  });
}
