import db from "../db/conection";
import Client from "../models/client";
import User from "../models/user";

export const deleteUserAndClientState = async (userId: string) => {
    const transaction = await db.transaction();

    try {
        await User.update(
            { state: false },
            { where: { id: userId }, transaction }
        );

        await Client.update(
            { state: false },
            { where: { user_id: userId }, transaction }
        );
        await transaction.commit();
        console.log('Estados actualizados correctamente');
    } catch (error: any) {
        await transaction.rollback();
        throw new Error(error)
    }
};