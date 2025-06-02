var axios = require("axios").default;
var fs = require("fs").promises;
const path = require('path');

const { CustomizeNewUniversalLoginPages, mostrarFecha } = require("./CustomizeNewUniversalLoginPages");
require("dotenv").config();

(async () => {

	console.clear()
	let customizeNewUniversalLoginPages =
		new CustomizeNewUniversalLoginPages(
			process.env.CLIENT_ID,
			process.env.CLIENT_SECRET,
			process.env.AUTH0_DOMAIN,
			false
		);

	await customizeNewUniversalLoginPages.requestAccessToken();
	templateManager("download", customizeNewUniversalLoginPages)

})();


async function templateManager(action, customizeNewUniversalLoginPages) {
	switch (action) {
		case "update":
			console.log("update")
			let newTemplate = await fs.readFile("./template.html", "utf-8");
			customizeNewUniversalLoginPages.updateTemplate(newTemplate);
			break;

		case "download":
			console.log("download")
			let oldTemplate = await customizeNewUniversalLoginPages.retrieveTemplate();
			let date = mostrarFecha()
			customizeNewUniversalLoginPages.saveTemplate(oldTemplate, `template.html`);
			break;

		case "delete":
			customizeNewUniversalLoginPages.deleteTemplate()
			break;

		default:
			console("Esta opcion no existe")
			break;

	}

}
