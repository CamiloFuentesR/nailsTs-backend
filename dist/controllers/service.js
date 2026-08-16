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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateService = exports.createService = exports.getServicesById = exports.getServicesByCategory = exports.getServices = void 0;
const models_1 = require("../models");
/**
 * Traduce a booleano lo que venga en el cuerpo (es_complemento, por_unidad).
 *
 * Devuelve undefined cuando el campo no viene o no se entiende, y ese undefined
 * es la señal de "no lo toques": al crear deja que aplique el DEFAULT false de
 * la columna, y al actualizar deja el valor que el servicio ya tenía.
 *
 * A propósito no acepta 1/2 como state, donde el 2 es false porque viene de un
 * <select>. Mezclar las dos convenciones en el mismo cuerpo se presta para
 * guardar true donde iba false; el panel manda un booleano de verdad.
 */
const leerBooleano = (valor) => {
    if (typeof valor === 'boolean')
        return valor;
    if (valor === 'true')
        return true;
    if (valor === 'false')
        return false;
    return undefined;
};
/**
 * Marca de "vino, pero mal".
 *
 * Los campos nuevos necesitan distinguir TRES cosas y no dos, y por eso no basta
 * con null ni con undefined:
 *
 *   ausente  -> no se toca lo guardado (la regla que ya rige es_complemento).
 *   vacío    -> se borra, se guarda null. Es una intención real: sacarle a un
 *               servicio el precio condicional o el tope de unidades.
 *   inválido -> 400. Un -1 o un 2,5 en una columna INTEGER no es "vacío".
 *
 * Es un símbolo y no un string centinela para que no pueda colisionar nunca con
 * un valor que mande el cuerpo.
 */
const INVALIDO = Symbol('valor inválido');
/** La columna unidad es VARCHAR(20). */
const LARGO_MAXIMO_UNIDAD = 20;
/**
 * Lee un entero opcional del cuerpo, con mínimo incluido.
 *
 * El chequeo de entero no es cosmético: precio_agregado y maximo_unidades son
 * columnas INTEGER, así que un 2500,5 lo redondea Postgres en silencio y el
 * precio guardado deja de ser el que ella escribió.
 *
 * El '' se trata como vacío y nunca se deja llegar a Number: Number('') es 0, y
 * un 0 en precio_agregado significa "este servicio es gratis al agregarse", que
 * es un cobro real y no un campo sin llenar. El mismo cuidado con '   ', que
 * también da 0. Es exactamente el null que _.omitBy de Sequelize no descarta.
 */
const leerEnteroOpcional = (valor, minimo) => {
    if (valor === undefined)
        return undefined;
    if (valor === null)
        return null;
    if (typeof valor === 'string') {
        if (valor.trim() === '')
            return null;
    }
    else if (typeof valor !== 'number') {
        // Un booleano o un arreglo también pasan por Number() sin quejarse
        // (Number(true) es 1), así que se cortan acá.
        return INVALIDO;
    }
    const numero = Number(valor);
    if (!Number.isInteger(numero))
        return INVALIDO;
    if (numero < minimo)
        return INVALIDO;
    return numero;
};
/**
 * Lee el sustantivo de la unidad ("uña").
 *
 * No baja la caja, al revés que `grupo` en categorías: el grupo es una llave
 * interna que se compara por igualdad, y este texto se le muestra tal cual a la
 * clienta al lado del número.
 *
 * El largo se valida acá porque la columna es VARCHAR(20): sin esto Postgres
 * responde 22001 y el controlador lo convierte en un 500 que parece una caída
 * del servidor cuando en realidad es un campo muy largo.
 */
const leerUnidad = (valor) => {
    if (valor === undefined)
        return undefined;
    if (valor === null)
        return null;
    if (typeof valor !== 'string')
        return INVALIDO;
    const limpio = valor.trim();
    if (limpio.length === 0)
        return null;
    if (limpio.length > LARGO_MAXIMO_UNIDAD)
        return INVALIDO;
    return limpio;
};
const MSG_PRECIO_AGREGADO = 'El precio al agregarse debe ser un número entero de pesos, sin decimales y no negativo';
const MSG_MAXIMO_UNIDADES = 'El máximo de unidades debe ser un número entero mayor que 0';
const MSG_UNIDAD = `El nombre de la unidad debe ser un texto de hasta ${LARGO_MAXIMO_UNIDAD} caracteres`;
const MSG_UNIDAD_FALTANTE = 'Un servicio que se cobra por unidad necesita el nombre de la unidad, por ejemplo "uña"';
const getServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield models_1.Service.findAll({
            include: [
                {
                    model: models_1.ServicesCategory,
                    as: 'category',
                },
            ],
        });
        if (services.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'Servicios - no se encontraron servicios',
            });
        }
        return res.status(200).json({
            ok: true,
            services,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: error,
        });
    }
});
exports.getServices = getServices;
const getServicesByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const services = yield models_1.Service.findAll({
            where: { services_category_id: id, state: true },
        });
        if (!services) {
            return res.status(409).json({
                ok: false,
                msg: 'No se encontraron servicios',
            });
        }
        return res.status(200).json({
            ok: true,
            services,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
});
exports.getServicesByCategory = getServicesByCategory;
const getServicesById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const services = yield models_1.Service.findByPk(id);
        if (!services) {
            return res.status(409).json({
                ok: false,
                msg: 'No se encontraron servicios',
            });
        }
        return res.status(200).json({
            ok: true,
            services,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
});
exports.getServicesById = getServicesById;
const createService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, services_category_id, duration, es_complemento, precio_agregado, por_unidad, unidad, maximo_unidades, } = req.body;
    if (name === '') {
        return res.status(401).json({
            ok: false,
            msg: 'El nombre no puede estar vacío',
        });
    }
    else if (services_category_id === '') {
        return res.status(401).json({
            ok: false,
            msg: 'La id no puede estar vacía',
        });
    }
    else if (price === '') {
        return res.status(401).json({
            ok: false,
            msg: 'El precio no puede estar vacío',
        });
    }
    const precioAgregado = leerEnteroOpcional(precio_agregado, 0);
    if (precioAgregado === INVALIDO) {
        return res.status(400).json({ ok: false, msg: MSG_PRECIO_AGREGADO });
    }
    const maximoUnidades = leerEnteroOpcional(maximo_unidades, 1);
    if (maximoUnidades === INVALIDO) {
        return res.status(400).json({ ok: false, msg: MSG_MAXIMO_UNIDADES });
    }
    const nombreUnidad = leerUnidad(unidad);
    if (nombreUnidad === INVALIDO) {
        return res.status(400).json({ ok: false, msg: MSG_UNIDAD });
    }
    const porUnidad = leerBooleano(por_unidad);
    // Se rechaza en vez de inventar un sustantivo por omisión. La pantalla escribe
    // el número y al lado esta palabra, así que sin ella la clienta lee "3 " y no
    // sabe qué está eligiendo; y una unidad puesta por el código ("unidad") se
    // vería en la reserva como si la hubiera escrito ella. Un rótulo equivocado en
    // silencio es peor que un error que el panel muestra mientras lo llena.
    if (porUnidad === true && !nombreUnidad) {
        return res.status(400).json({ ok: false, msg: MSG_UNIDAD_FALTANTE });
    }
    try {
        const serviceExist = yield models_1.Service.findOne({ where: { name } });
        if (serviceExist) {
            return res.status(404).json({
                ok: false,
                msg: 'Ya existe un servicio con ese nombre',
            });
        }
        const data = {
            name,
            price,
            duration,
            state: true,
            // Si el cuerpo no lo trae queda undefined, y ahí Sequelize aplica el
            // defaultValue del modelo: el servicio nace como principal.
            es_complemento: leerBooleano(es_complemento),
            // Mismo criterio para los cuatro de abajo: undefined deja que mande el
            // defaultValue de la columna, o sea un servicio de precio único que se
            // cobra una vez, que es como se comportan todos los que ya existen.
            precio_agregado: precioAgregado,
            por_unidad: porUnidad,
            unidad: nombreUnidad,
            maximo_unidades: maximoUnidades,
            services_category_id,
        };
        const service = yield models_1.Service.create(data);
        // Consulta el servicio recién creado para incluir la categoría
        const serviceWithCategory = yield models_1.Service.findByPk(service.id, {
            include: [
                {
                    model: models_1.ServicesCategory,
                    as: 'category',
                },
            ],
        });
        return res.status(201).json({
            ok: true,
            service: serviceWithCategory,
        });
    }
    catch (error) {
        console.error(error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(500).json({
                ok: false,
                msg: 'La categoria-servicio no existe, contacte con el administrador',
            });
        }
        return res.status(500).json({
            ok: false,
            msg: 'Server internal error',
        });
    }
});
exports.createService = createService;
const updateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    let { body } = req;
    if (body.state === 1) {
        body.state = true;
    }
    else if (body.state === 2) {
        body.state = false;
    }
    // Crear una copia del cuerpo y excluir el campo `id`
    const { id: _ } = body, bodyWithoutId = __rest(body, ["id"]);
    // Qué campos venían en el cuerpo, antes de que se les borre la clave. Solo se
    // usa para decidir si la coherencia entre por_unidad y unidad es asunto de
    // esta petición; ver más abajo.
    const tocaPorUnidad = 'por_unidad' in bodyWithoutId || 'unidad' in bodyWithoutId;
    // El campo que no viene tiene que quedar como está. Sequelize ya resuelve el
    // undefined (Model.update descarta esas claves antes de armar el SET), pero
    // un null o un '' sí llegarían a la consulta, y la columna es NOT NULL: la
    // administradora que solo edita el precio desmarcaría el complemento sin
    // darse cuenta, o se llevaría un 500. Por eso se saca la clave salvo que
    // traiga un booleano legible.
    const esComplemento = leerBooleano(bodyWithoutId.es_complemento);
    if (esComplemento === undefined) {
        delete bodyWithoutId.es_complemento;
    }
    else {
        bodyWithoutId.es_complemento = esComplemento;
    }
    // por_unidad es NOT NULL igual que es_complemento, así que corre la misma
    // regla exacta: sin booleano legible, la clave se saca.
    const porUnidad = leerBooleano(bodyWithoutId.por_unidad);
    if (porUnidad === undefined) {
        delete bodyWithoutId.por_unidad;
    }
    else {
        bodyWithoutId.por_unidad = porUnidad;
    }
    // Los tres que sí son nullable distinguen "no vino" de "vino vacío": la clave
    // se saca solo cuando el campo está ausente, porque un vacío explícito es la
    // forma de quitarle a un servicio el precio condicional o el tope.
    const precioAgregado = leerEnteroOpcional(bodyWithoutId.precio_agregado, 0);
    if (precioAgregado === INVALIDO) {
        return res.status(400).json({ ok: false, msg: MSG_PRECIO_AGREGADO });
    }
    if (precioAgregado === undefined) {
        delete bodyWithoutId.precio_agregado;
    }
    else {
        bodyWithoutId.precio_agregado = precioAgregado;
    }
    const maximoUnidades = leerEnteroOpcional(bodyWithoutId.maximo_unidades, 1);
    if (maximoUnidades === INVALIDO) {
        return res.status(400).json({ ok: false, msg: MSG_MAXIMO_UNIDADES });
    }
    if (maximoUnidades === undefined) {
        delete bodyWithoutId.maximo_unidades;
    }
    else {
        bodyWithoutId.maximo_unidades = maximoUnidades;
    }
    const nombreUnidad = leerUnidad(bodyWithoutId.unidad);
    if (nombreUnidad === INVALIDO) {
        return res.status(400).json({ ok: false, msg: MSG_UNIDAD });
    }
    if (nombreUnidad === undefined) {
        delete bodyWithoutId.unidad;
    }
    else {
        bodyWithoutId.unidad = nombreUnidad;
    }
    try {
        // Buscar el servicio por su id
        let service = yield models_1.Service.findByPk(id);
        if (!service) {
            return res.status(400).json({
                ok: false,
                msg: 'No se encontró este servicio',
            });
        }
        /*
         * Un servicio por unidad sin el sustantivo es un dato incompleto: la
         * pantalla escribe "3 " y la clienta no sabe qué está eligiendo.
         *
         * Se mira cómo queda el servicio DESPUÉS de aplicar el cuerpo, y no solo lo
         * que trae el cuerpo, porque marcar por_unidad en un servicio que ya tenía
         * su unidad guardada es perfectamente válido y no debería obligar a
         * reenviarla.
         *
         * Y se valida solo si la petición toca alguno de los dos campos: si no los
         * toca, no es asunto suyo. Sin esa condición, un servicio que quedó a medias
         * por una edición hecha a mano en la base dejaría a la administradora sin
         * poder cambiarle el precio ni desactivarlo hasta arreglarlo.
         */
        const porUnidadFinal = porUnidad !== null && porUnidad !== void 0 ? porUnidad : service.por_unidad;
        const unidadFinal = nombreUnidad !== undefined ? nombreUnidad : service.unidad;
        if (tocaPorUnidad && porUnidadFinal && !unidadFinal) {
            return res.status(400).json({ ok: false, msg: MSG_UNIDAD_FALTANTE });
        }
        // Actualizar el servicio con los nuevos datos
        const [updatedRowsCount] = yield models_1.Service.update(bodyWithoutId, {
            where: { id },
        });
        // Verificar si la actualización se realizó correctamente
        if (updatedRowsCount === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'Servicio no encontrado o no actualizado',
            });
        }
        // Obtener el servicio actualizado con su categoría
        const updatedService = yield models_1.Service.findByPk(id, {
            include: [
                {
                    model: models_1.ServicesCategory,
                    as: 'category',
                },
            ],
        });
        return res.status(201).json({
            ok: true,
            msg: 'Servicio actualizado correctamente',
            service: updatedService,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor',
        });
    }
});
exports.updateService = updateService;
//# sourceMappingURL=service.js.map