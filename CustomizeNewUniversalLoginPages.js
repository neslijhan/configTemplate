/*  

	Esta clase requiere una aplicacion M2M con los siguientes permisos sobre Auth0 Management API 
	[update:branding, read:branding, delete:branding] para actualizar los templates
	[read:prompts, update:prompts] para custom prompts
	
*/

var axios = require("axios").default;
var fs = require("fs").promises;
const https = require('https');
const { url } = require("inspector");
const axiosInstance = axios.create({
	httpsAgent: new (require('https').Agent)({
		rejectUnauthorized: false
	  })
  });

class CustomizeNewUniversalLoginPages{

	token_type;
	access_token;

	constructor(clientID, clientSecret, domain, debbug) {
		this.clientID = clientID;
		this.clientSecret = clientSecret;
		this.domain = domain;
		this.templatesEndPoint = "/api/v2/branding/templates/universal-login";
		this.debbug = debbug ? debbug : false;

	}

	async requestAccessToken(){
		console.log("teeeeeeeeeeeeeeeeeeeeeeeeee")
		let axiosOptions = {
			method: 'POST',
			url: this.domain + "/oauth/token",
			headers: {'content-type': 'application/json'},
			data: {
				grant_type: 'client_credentials',
				audience: this.domain + "/api/v2/",
				scope: 'read:branding update:branding delete:branding read:prompts update:prompts',
				client_id: this.clientID,
				client_secret: this.clientSecret
			},
			httpsAgent: new https.Agent({
			  rejectUnauthorized: false  // Desactiva la verificación de certificados (solo para desarrollo)
			})
		};
		
		try {

			let requestToken = await axios.request(axiosOptions);
			this.token_type = requestToken.data.token_type;
			this.access_token = requestToken.data.access_token;
			console.log("token type: " + this.token_type)
			console.log(`access token:\n${this.access_token} \n`);
			if (this.debbug){
				console.log("token type: " + this.token_type);
				console.log(`access token:\n${this.access_token} \n`);
				
			}
			//await this.getUser(this.access_token);

		} catch (error) {

			this.token_type = false;
			this.access_token = false;
			//console.log(error)
			console.log("ERROR al solicitar access token")

		}
	}

	async getUser(token){
		console.log("testttttttttttttttttttttt")
		let query_username = `username:"70552336"`;
		let query_ruc = `user_metadata.enterprise.ruc:"39555877223"`;
		let query_status = `user_metadata.status:"0"`;
		let query = encodeURIComponent(query_username) + " AND " + encodeURIComponent(query_ruc) + " AND " + encodeURIComponent(query_status);
		let config = {
			method: 'get',
			maxBodyLength: Infinity,
			url: `${this.domain}/api/v2/users?q=${query}&search_engine=v2`,
			headers: {
				'Accept': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			httpsAgent: new https.Agent({
			  rejectUnauthorized: false  // Desactiva la verificación de certificados (solo para desarrollo)
			})
		};
		try {
			let response = await axios.request(config);
			console.log(response);
			console.log(response.data.length);
			if (response.data.length === 0) {
				//error nombre de usuario y contraseña incorrecto
						  console.log("error nombre de usuario y contraseña incorrecto");
					  } else {
						  //solicita cambio de contraseña
						  console.log("solicita cambio de contraseña");
					  }
		} catch (error) {
			console.log("ERROR al solicitar access token")
		}
		
	}

	async updateTemplate(template){
		//console.log("🔹🔹🔹",template)
		var axiosOptions = {
			method: 'PUT',
			url: this.domain + this.templatesEndPoint,
			headers: { 
				'content-type': 'text/html',
				"authorization": `${this.token_type} ${this.access_token}`
			},
			data: template,
			httpsAgent: new https.Agent({
			  rejectUnauthorized: false  // Desactiva la verificación de certificados (solo para desarrollo)
			})
		};
	
		try {
			await axios.request(axiosOptions);
			let fecha = mostrarFecha();
			console.log(`***** ${fecha} - Template was updated successfully *****\n`);

			/*
			Test template with a regular web app CLIENT_ID
			https://${DOMINIO}/authorize?
			response_type=code&
			client_id=${REGULAR_WEB_APP_CLIENT_ID}&
			redirect_uri=https%3A%2F%2Flocalhost:3000%2Fcallback&
			scope=openid%20profile%20email
			*/

		} catch (error) {
			console.error(error);
		}
	
	}

	async deleteTemplate(){

		var axiosOptions = {
			method: 'DELETE',
			url: this.domain + this.templatesEndPoint,
			headers: { 
				"authorization": `${this.token_type} ${this.access_token}`
			}
		};
	
		try {
			await axios.request(axiosOptions);
			let fecha = mostrarFecha();
			console.log(`***** ${fecha} - Template successfully deleted.*****\n`);
		} catch (error) {
			console.error(error);
		}


	}

	async retrieveTemplate(){
		
		var axiosOptions = {
			method: 'GET',
			url: this.domain + this.templatesEndPoint,
			headers: { 
				"Accept": "text/html",
				"authorization": `${this.token_type} ${this.access_token}`
			},
			httpsAgent: new https.Agent({
			  rejectUnauthorized: false  // Desactiva la verificación de certificados (solo para desarrollo)
			})
		};
	
		try {
			let currentTemplate = await axios.request(axiosOptions);
			let fecha = mostrarFecha();
			console.log(`***** ${fecha} - Template successfully retrieved.*****\n`);
			console.log(currentTemplate.data);
			return(currentTemplate.data)

		} catch (error) {
			console.error(error);
		}


	}

	saveTemplate(contenido, destino){
		console.log("destino")
		console.log(destino)
		//contenido es un string, en este caso el contenido de un html
		//destino es la ruta donde se guardara el archivo, en este caso se guarda en raiz
			fs.writeFile(destino, contenido, (err) => {
				if (err) {
					console.error('Error al crear el archivo:', err);
					return;
				}
				console.log('Archivo creado con éxito');
			});
		
	}


}

function mostrarFecha(){

	// Obtener la fecha actual
	var fechaActual = new Date();

	// Obtener los componentes de la fecha
	var año = fechaActual.getFullYear();
	var mes = ('0' + (fechaActual.getMonth() + 1)).slice(-2); // Sumamos 1 al mes porque los meses van de 0 a 11
	var dia = ('0' + fechaActual.getDate()).slice(-2);
	var horas = ('0' + fechaActual.getHours()).slice(-2);
	var minutos = ('0' + fechaActual.getMinutes()).slice(-2);
	var segundos = ('0' + fechaActual.getSeconds()).slice(-2);

	// Construir la cadena de fecha en el formato deseado
	var fechaFormateada = año + '-' + mes + '-' + dia + ' ' + horas + ':' + minutos + ':' + segundos;

	return fechaFormateada;

}

module.exports.CustomizeNewUniversalLoginPages = CustomizeNewUniversalLoginPages
module.exports.mostrarFecha = mostrarFecha