import { UploadedFile } from 'express-fileupload';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const validExtensio = ['txt', 'md', 'jpg', 'png', 'webp', 'jpeg', 'gif'];
export const uploadFiles = (
  file: UploadedFile,
  validExtensions: string[] = validExtensio,
  folder: string = '',
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Obtener extensión del archivo
    const cutName = file.name.split('.');
    const extension = cutName[cutName.length - 1];
    console.log(validExtensions);
    console.log(extension);
    // Validar la extensión
    if (!validExtensions?.includes(extension)) {
      return reject(
        `La extensión ${extension} no es válida. Extensiones permitidas: ${validExtensions?.join(
          ', ',
        )}`,
      );
    }

    // Generar un nombre único para el archivo
    const tempName = uuidv4() + '.' + extension;

    // Ruta donde se almacenará el archivo
    const uploadPath = path.join(__dirname, '../uploads/', folder, tempName);

    // Mover el archivo a la carpeta de destino
    file.mv(uploadPath, err => {
      if (err) {
        return reject(err);
      }
      resolve(tempName);
    });
  });
};
