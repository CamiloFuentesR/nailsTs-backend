import { Response } from 'express';
import db from '../db/conection';
import { Client, User } from '../models';

export const deleteUserAndClientState = async (
  userId: string,
  res: Response,
) => {
  const transaction = await db.transaction();

  try {
    const client = await Client.findOne({
      where: { user_id: userId, state: true },
      transaction,
    });
    const user = await User.findByPk(userId);

    if (!client) {
      throw new Error(`Cliente no encontrado o ya está eliminado`);
    }

    const [affectedRowsClient, [updatedClient]] = await Client.update(
      { state: false },
      { where: { user_id: userId }, returning: true, transaction },
    );
    const [affectedRows, [updatedUser]] = await User.update(
      { state: false },
      { where: { id: userId }, returning: true, transaction },
    );

    await transaction.commit();

    console.log('Cliente y usuario eliminados exitosamente');
    return res.status(200).json({
      ok: true,
      msg: 'Cliente y usuario eliminados exitosamente',
      updatedUser,
      updatedClient,
    });
  } catch (error: any) {
    await transaction.rollback();
    throw new Error(error.message);
  }
};
