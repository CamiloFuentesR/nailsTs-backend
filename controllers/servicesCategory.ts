import { Request, Response } from 'express';
import ServicesCategory from '../models/servicesCategory';



export const getServicesCategory = async (req: Request, res: Response) => {
    try {
        const serCat = await ServicesCategory.findAll()

        if (!serCat) {

        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        })
    }

}


export const createCategory = async (req: Request, res: Response) => {

    const { name } = req.body;
    if (name === '') {
        return res.status(401).json({
            ok: false,
            msg: 'El nombre no puede estar vacío'
        })
    }
    try {
        const categoryExist = await ServicesCategory.findOne({ where: { name } })

        if (categoryExist) {
            return res.status(404).json({
                ok:false,
                msg:'Ya existe una categoría con ese nombre'
            })
        }
        // category = 

    } catch (error) {
        console.error(error);
    }


}