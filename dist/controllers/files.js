"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showFile = exports.updateFileClaudinary = exports.postFileClaudinary = exports.updateFile = exports.uploadFile = void 0;
const uploadFiles_1 = require("../helpers/uploadFiles");
const models_1 = require("../models");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = require("cloudinary");
if (process.env.CLOUDINARY_URL) {
    cloudinary_1.v2.config({ cloudinary_url: process.env.CLOUDINARY_URL });
}
else {
    throw new Error('CLOUDINARY_URL is not defined in environment variables');
}
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Extensiones permitidas
        const validExtensions = ['txt', 'md', 'jpg', 'png', 'webp', 'jpeg', 'gif'];
        const { collection } = req.params;
        // Extraer archivo individual
        const file = (_a = req.files) === null || _a === void 0 ? void 0 : _a.file;
        // Subir archivo
        const name = yield (0, uploadFiles_1.uploadFiles)(file, validExtensions, collection);
        res.json({
            ok: true,
            name,
        });
    }
    catch (error) {
        res.status(400).json({
            ok: false,
            msg: error.message || error,
        });
    }
});
exports.uploadFile = uploadFile;
const updateFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, collection } = req.params;
    let model;
    try {
        switch (collection) {
            case 'user': {
                const user = yield models_1.Client.findByPk(id);
                if (!user) {
                    return res.status(400).json({
                        msg: `No existe un usuario con el id ${id}`,
                    });
                }
                model = user;
                break;
            }
            case 'category': {
                const product = yield models_1.ServicesCategory.findByPk(id);
                if (!product) {
                    return res.status(400).json({
                        msg: `No existe un producto con el id ${id}`,
                    });
                }
                model = product;
                break;
            }
            default:
                return res.status(500).json({
                    msg: 'No hay búsquedas con esa colección',
                });
        }
        if (model.img) {
            const pathImg = path_1.default.join(__dirname, '../uploads/', collection, model.img);
            if (fs_1.default.existsSync(pathImg)) {
                fs_1.default.unlinkSync(pathImg);
            }
        }
        const file = (_a = req.files) === null || _a === void 0 ? void 0 : _a.file;
        const name = yield (0, uploadFiles_1.uploadFiles)(file, undefined, collection);
        model.img = name;
        yield model.save();
        res.json({
            model,
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
});
exports.updateFile = updateFile;
const postFileClaudinary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, collection } = req.params;
    console.log(req.files);
    let model;
    console.log(collection);
    console.log(req.body);
    console.log(id);
    // const category = await ServicesCategory.findByPk(id);
    // if (!category) {
    //   return res.status(400).json({
    //     msg: `No existe un producto con el id ${id}`,
    //   });
    // }
    // model = collection.cartegory as ModelWithImg;
    // if (model.img) {
    //   const nombreArr = model.img.split('/');
    //   const nombre = nombreArr[nombreArr.length - 1];
    //   const [public_id] = nombre.split('.');
    //   cloudinary.uploader.destroy(`${id}/${public_id}`);
    // }
    const { tempFilePath } = (_a = req.files) === null || _a === void 0 ? void 0 : _a.file;
    // Crear la carpeta dinámica según la colección
    const folderPath = `RestServer NodeJs/${id}`;
    const { secure_url } = yield cloudinary_1.v2.uploader.upload(tempFilePath, {
        folder: id,
    });
    // Puedes guardar el URL en el modelo o hacer lo que necesites
    // model.img = secure_url;
    // await model.save();
    res.json({
        ok: true,
        // model,
    });
});
exports.postFileClaudinary = postFileClaudinary;
const updateFileClaudinary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, collection } = req.params;
    let model;
    console.log('collection');
    console.log(collection);
    try {
        switch (collection) {
            case 'user': {
                const user = yield models_1.Client.findByPk(id);
                if (!user) {
                    return res.status(400).json({
                        msg: `No existe un usuario con el id ${id}`,
                    });
                }
                model = user;
                break;
            }
            case 'category': {
                const category = yield models_1.ServicesCategory.findByPk(id);
                if (!category) {
                    return res.status(400).json({
                        msg: `No existe un producto con el id ${id}`,
                    });
                }
                model = category;
                break;
            }
            default:
                return res.status(500).json({
                    msg: 'No hay búsquedas con esa colección',
                });
        }
        if (model.img) {
            const nombreArr = model.img.split('/');
            const nombre = nombreArr[nombreArr.length - 1];
            const [public_id] = nombre.split('.');
            cloudinary_1.v2.uploader.destroy(`${collection}/${public_id}`);
        }
        const { tempFilePath } = (_a = req.files) === null || _a === void 0 ? void 0 : _a.file;
        // Crear la carpeta dinámica según la colección
        const folderPath = `RestServer NodeJs/${collection}`;
        const { secure_url } = yield cloudinary_1.v2.uploader.upload(tempFilePath, {
            folder: collection,
        });
        console.log(model);
        // Puedes guardar el URL en el modelo o hacer lo que necesites
        model.img = secure_url;
        yield model.save();
        res.json({
            model,
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
});
exports.updateFileClaudinary = updateFileClaudinary;
const showFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, collection } = req.params;
    let model;
    try {
        switch (collection) {
            case 'user': {
                const user = yield models_1.Client.findByPk(id);
                if (!user) {
                    return res.status(400).json({
                        msg: `No existe un usuario con el id ${id}`,
                    });
                }
                model = user;
                break;
            }
            case 'category': {
                const product = yield models_1.ServicesCategory.findByPk(id);
                if (!product) {
                    return res.status(400).json({
                        msg: `No existe un producto con el id ${id}`,
                    });
                }
                model = product;
                break;
            }
            default:
                return res.status(500).json({
                    msg: 'No hay búsquedas con esa colección',
                });
        }
        if (model.img) {
            const pathImg = path_1.default.join(__dirname, '../uploads/', collection, model.img);
            if (fs_1.default.existsSync(pathImg)) {
                return res.sendFile(pathImg);
            }
        }
        const pathImg = path_1.default.join(__dirname, '../uploads/nodata/', 'no-image.jpeg');
        res.sendFile(pathImg);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
});
exports.showFile = showFile;
//# sourceMappingURL=files.js.map