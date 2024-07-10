import { Response } from 'express';
import db from '../db/conection';
import { Client, User, UserInstance } from '../models';
import { UserProps } from '../interfaces';

export const updateUserAndClientState = async (
  userId: string,
  body: UserProps,
  res: Response,
) => {
  const transaction = await db.transaction();

  try {
    const client = await Client.findOne({
      where: { user_id: userId },
    });
    const user: UserInstance | null = await User.findByPk(userId);
    const { email, role_id, state, Client: clientData } = body;
    if (!client && user !== null) {
      const client = Client.build({
        name: clientData?.name,
        phone_number: clientData?.phone_number,
        user_id: user.id,
        state: true,
      });

      await client.save();
    }

    const userUpdateResult = await User.update(
      { email, role_id, state },
      {
        where: { id: userId },
        returning: true,
        transaction,
      },
    );

    if (!userUpdateResult || userUpdateResult.length < 2) {
      throw new Error(`Error actualizando el usuario`);
    }

    const [affectedRows, updatedUserArray] = userUpdateResult;
    const updatedUser = updatedUserArray[0];

    const clientUpdateResult = await Client.update(
      { name: clientData?.name, phone_number: clientData?.phone_number, state },
      {
        where: { user_id: userId },
        returning: true,
        transaction,
      },
    );

    if (!clientUpdateResult || clientUpdateResult.length < 2) {
      throw new Error(`Error actualizando el cliente`);
    }

    const [affectedRowsClient, updatedClientArray] = clientUpdateResult;
    const updatedClient = updatedClientArray[0];

    await transaction.commit();

    console.log('Cliente y usuario actualizados exitosamente');
    return res.status(200).json({
      ok: true,
      msg: 'Cliente y usuario actualizados exitosamente',
      updatedUser,
      updatedClient,
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error actualizando cliente y usuario',
      error: error.message,
    });
  }
};
