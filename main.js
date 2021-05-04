//* Práctica módulo 6 NODE de Arantxa Unzueta
/* Definir un servicio para crear y listar usuarios que atienda peticiones de 
tipo POST para que se acepte la petición e interpreten los parámetros que se
dispongan en el cuerpo de la petición.

El servicio debe recibir los parámetros 'name' y 'phone' con los datos de un
usuario a insertar en la bbdd. La petición se puede simular utilizando Postman con una petición POST
y enviando el cuerpo de la petición utilizando la cabecera 'x-www.form-urlencoded'.

Se utilizará el módulo 'Query String' de Node para traducir el cuerpo de la petición
a variables que se puedan utilizar: https://nodejs.org/api/querystring.html 
*/
const http = require('http')
const querystring = require('querystring');
const MongoClient = require('mongodb').MongoClient;


//Definir el puerto a utilizar.
const port = 3000;

// Especificar la URL de conexión /////
const url = 'mongodb://localhost:27017';

//Especificar nombre de la bbdd
const dbName = 'practica_arantxa_u';

//Crear una instancia del cliente de MongoDB
const client = new MongoClient(url, { useUnifiedTopology: true });

//CREAR SERVIDOR Y DEFINIR RESPUESTA PETICIONES
const server = http.createServer((request, response) => {
    // Extraer el contenido de la petición
    const { headers, method, url } = request;
    console.log('headers: ', headers);
    console.log('method: ', method);
    console.log('url: ', url);


    // Definir el array para concatenar la peticiones
    let body = [];

    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        // Concatenar los trozos de la petición y meterlos en el array "body"
        body.push(chunk);
    }).on('end', (data) => {
        body = Buffer.concat(body).toString();
        console.log('body: ', body);

        //CONECTAR EL CLIENTE DE LA BBDD AL SERVIDOR
        client.connect().then(async () => {
            console.log('Conectado con éxito al servidor');
            const db = client.db(dbName);

            //Definir colección como 'usuarios' en la base de datos
            const collection = db.collection('usuarios');
            //Definir documento
            const document = querystring.decode(body);

            //Llamar a la función para insertar
            const insertResult = await collection.insertOne(document);
            console.log('Resultado de la inserción: ', insertResult.result);

            //Llamar a la función para recuperar
            const findResult = await collection.find({}).toArray();
            console.log('Datos recuperados: ', findResult);
            client.close();

            // Cuando el cuerpo de la petición está completo
        }).catch((error) => {
            console.log('Se produjo algún error en las operaciones con la base de datos: ' + error);
            client.close();
        });
    // Definir el código de estado, que será 200 si todo ha ido bien.    
    response.statusCode = 200;
    // Definir los encabezados de la respuesta como texto plano
    response.setHeader('Content-Type', 'text/plain');
    // Contenido de la respuesta
    response.end('Hola Mundo');
    });

})
// Ejecutar el servicio para que permanezca a la espera de peticiones
server.listen(port, () => {
    console.log('Servidor ejecutándose...');
    console.log('Abrir en un navegador http://localhost:3000');
});





