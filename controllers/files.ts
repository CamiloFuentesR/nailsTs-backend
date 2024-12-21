import { Request, Response } from 'express';
import { uploadFiles } from '../helpers/uploadFiles';
import { UploadedFile } from 'express-fileupload';
import { Service, ServicesCategory, User } from '../models';
import path from 'path';
import fs from 'fs';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    // Extensiones permitidas
    const validExtensions = ['txt', 'md', 'jpg', 'png', 'webp', 'jpeg', 'gif'];
    const { collection } = req.params;

    // Extraer archivo individual
    const file = req.files?.file as UploadedFile;

    // Subir archivo
    const name = await uploadFiles(file, validExtensions, collection);

    res.json({
      ok: true,
      name,
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      msg: error.message || error,
    });
  }
};

interface ModelWithImg {
  img?: string;
  save: () => Promise<this>;
}

export const updateFile = async (req: Request, res: Response) => {
  const { id, collection } = req.params;
  let model: ModelWithImg;

  try {
    switch (collection) {
      case 'user': {
        const user = await User.findByPk(id);
        if (!user) {
          return res.status(400).json({
            msg: `No existe un usuario con el id ${id}`,
          });
        }
        model = user as ModelWithImg;
        break;
      }
      case 'category': {
        const product = await ServicesCategory.findByPk(id);
        if (!product) {
          return res.status(400).json({
            msg: `No existe un producto con el id ${id}`,
          });
        }
        model = product as ModelWithImg;
        break;
      }
      default:
        return res.status(500).json({
          msg: 'No hay búsquedas con esa colección',
        });
    }

    if (model.img) {
      const pathImg = path.join(
        __dirname,
        '../../uploads/',
        collection,
        model.img,
      );
      if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
      }
    }

    const file = req.files?.file as UploadedFile;
    const name = await uploadFiles(file, undefined, collection);

    model.img = name;
    await model.save();

    res.json({
      model,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

export const showFile = async (req: Request, res: Response) => {
  const { id, collection } = req.params;
  let model: ModelWithImg;

  try {
    switch (collection) {
      case 'user': {
        const user = await User.findByPk(id);
        if (!user) {
          return res.status(400).json({
            msg: `No existe un usuario con el id ${id}`,
          });
        }
        model = user as ModelWithImg;
        break;
      }
      case 'category': {
        const product = await ServicesCategory.findByPk(id);
        if (!product) {
          return res.status(400).json({
            msg: `No existe un producto con el id ${id}`,
          });
        }
        model = product as ModelWithImg;
        break;
      }
      default:
        return res.status(500).json({
          msg: 'No hay búsquedas con esa colección',
        });
    }

    if (model.img) {
      const pathImg = path.join(
        __dirname,
        '../../uploads/',
        collection,
        model.img,
      );
      if (fs.existsSync(pathImg)) {
        return res.sendFile(pathImg);
      }
    }

    const pathImg = path.join(
      __dirname,
      '../../uploads/nodata/',
      'no-image.jpeg',
    );
    res.sendFile(pathImg);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
