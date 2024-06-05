import { Response } from 'express';
import db from '../db/conection';
import { Client, User } from '../models';

export const activeUserAndClientState = async (
  userId: string,
  res: Response
) => {
  const transaction = await db.transaction();

  try {
    const client = await Client.findOne({
      where: { user_id: userId, state: false },
      transaction,
    });
    await User.findByPk(userId);

    if (!client) {
      throw new Error(`Cliente ya se encuentra activo`);
    }

    const [affectedRowsClient, [updatedClient]] = await Client.update(
      { state: true },
      { where: { user_id: userId }, returning: true, transaction }
    );
    const [affectedRows, [updatedUser]] = await User.update(
      { state: true },
      { where: { id: userId }, returning: true, transaction }
    );

    await transaction.commit();

    console.log('Cliente y usuario activados exitosamente');
    return res.status(200).json({
      ok: true,
      msg: 'Cliente y usuario activados exitosamente',
      updatedUser,
      updatedClient,
    });
  } catch (error: any) {
    await transaction.rollback();
    throw new Error(error.message);
  }
};
