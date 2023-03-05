



// new TransactionTag({id: 0, name: '---', 						color: new Color('rgba(0, 0, 0, 0)')}),
// [

// 	new TransactionTag({id: 1, name: 'Kamer', 						color: new Color('rgb(106, 153, 208)'),
// 		filter: [
// 			[["targetName", "includes", "GAMMA"]],
// 			[["targetName", "includes", "Idealis"], ["description", "includes", "Periode:"]],
// 		]
// 	}),
// 	new SavingsTransactionTag({id: 2, name: 'Kleding', color: new Color('rgb(222, 131, 68)'), startValue: 282,
// 		filter: [
// 			[["description", "includes", "Modeschoenen"]],
// 			[["description", "includes", "Good Looking"]],
// 			[["targetName", "includes", "C&A"]],
// 		]
// 	}),
// 	new SavingsTransactionTag({id: 3, name: 'Studie', color: new Color('rgb(245, 194, 66)'), startValue: 77.02,
// 		filter: [
// 			[["targetName", "includes", "proefschriftmaken"]],
// 			[["targetName", "includes", "Studystore"]],
// 			[["targetName", "includes", "Bruna"]],
// 			[["description", "includes", "BRUNA"]],
// 			[["targetName", "includes", "Wageningen Universiteit"]],
// 			[["targetName", "includes", "SURFspot"]]
// 		]
// 	}),
// 	new TransactionTag({id: 4, name: 'Eten', color: new Color('rgb(126, 171, 85)'),
// 		filter: [
// 			[["description", "includes", "Jumbo"]],
// 			[["description", "includes", "Goudreinet"]],
// 			[["description", "includes", "Spar"]],
// 			[["description", "includes", "Brood"]],
// 			[["description", "includes", "Bakker"]],
// 			[["description", "includes", "Ekoplaza"]],
// 			[["description", "includes", "Bosveld"]],
// 			[["description", "includes", "Gino"]],
// 			[["description", "includes", "ALBERT HEIJN"]],
// 			[["description", "includes", "Natuurwinkel"]],
// 			[["description", "includes", "Coop"]],
// 			[["description", "includes", "Lidl"]],
// 		]
// 	}),
// 	new TransactionTag({id: 5, name: 'Verenigingen', color: new Color('rgb(104, 52, 154)'),
// 		filter: [
// 			[["targetName", "includes", "Muziekprodukties"]],
// 			[["targetName", "includes", "KENKON"]],
// 			[["targetName", "includes", "BUDO KAI TORA TORA"]],
// 		]
// 	}),
// 	new TransactionTag({id: 6, name: 'Verzekeringen', 				color: new Color('rgb(136, 150, 174)'),
// 		filter: [
// 			[["targetName", "includes", "Centraal Beheer"]],
// 			[["targetName", "includes", "Zilveren Kruis"]],
// 			[["description", "includes", "VOORSCHOT ZORGTOESLAG"]],
// 			[["targetName", "includes", "INFOMEDICS"]],
// 		]
// 	}),
// 	new TransactionTag({id: 7, name: 'Overig', 						color: new Color('rgb(158, 205, 251)')}),
// 	new TransactionTag({id: 8, name: 'WerkEnOverigeInkomsten',  	color: new Color('rgb(117, 251, 106)'), 
// 		filter: [
// 			[["targetName", "includes", "Persoonality"]],
// 			[["description", "includes", "Rente over positief saldo"]],
// 			[["targetName", "includes", "DUO Hoofdrekening"]],
// 			[["description", "includes", "CREDITRENTE"]],
// 		]
// 	}),
// 	new TransactionTag({id: 9, name: 'OuderVergoeding', 			color: new Color('rgb(117, 251, 189)'),
// 		filter: [
// 			[["description", "includes", "maandelijkse leef- en studievergoeding"]],
// 			[["description", "includes", "zakgeld"]]
// 		]
// 	}),
// 	new SavingsTransactionTag({id: 10, name: 'UitgaanPresentjesEnVervoer', color: new Color('rgb(230, 50, 247)'), 
// 		filter: [
// 			[["description", "includes", "OV-chipkaart"]],
// 			[["description", "includes", "Lexkesveer"]]
// 		]
// 	}),
// 	new SavingsTransactionTag({id: 11, name: 'Corridor', color: new Color('rgb(219, 225, 240)'), startValue: 250.43,
// 		filter: [
// 			[["description", "includes", "Corridor 15B"]],
// 			[["description", "includes", "HOEVESTEIN 239 15B"]]
// 		]
// 	}),
// 	new SavingsTransactionTag({id: 12, name: 'TelefoonEnNonHobbyTech', 	color: new Color('rgb(128, 128, 128)'),
// 		filter: [
// 			[["description", "includes", "Lebara"]],
// 			[["targetName", "includes", "Lebara"]]
// 		]
// 	}),
// ];





const TagManager = new class extends DataManager {
	availableColors = [
		{color: new Color('rgba(0, 0, 0, 0)'), name: '---'},
		{color: new Color('rgb(222, 131, 68)'), name: 'Red'},
		{color: new Color('rgb(245, 194, 66)'), name: 'Orange'},
		{color: new Color('rgb(245, 230, 66)'), name: 'Yellow'},
		{color: new Color('rgb(104, 52, 154)'), name: 'Purple'},
		{color: new Color('rgb(136, 150, 174)'), name: 'Blueish Gray'},
		{color: new Color('rgb(106, 153, 208)'), name: 'Blue'},
		{color: new Color('rgb(158, 205, 251)'), name: 'Light Blue'},
		{color: new Color('rgb(126, 171, 85)'), name: 'Moss Green'},
		{color: new Color('rgb(117, 251, 106)'), name: 'Green'},
		{color: new Color('rgb(117, 251, 189)'), name: 'Aqua'},
		{color: new Color('rgb(230, 50, 247)'), name: 'Pink'},
		{color: new Color('rgb(219, 225, 240)'), name: 'Light Gray'},
		{color: new Color('rgb(128, 128, 128)'), name: 'Dark Gray'},
	];


	constructor() {
		super({type: "tags", typeClass: TransactionTag});
	}


	addTag(_tag) {
		this.data.push(_tag);
		return this.writeData();
	}

	getTagById(_id) {
		return this.data.find((tag) => tag.id === _id);
	}

	getNewTagId() {
		if (this.data.length === 0) return 0;
		this.data.sort((a, b) => a.id > b.id);
		return this.data[this.data.length - 1].id + 1;
	}


	autoDetectTransactionTag(_transaction) {
		for (let tag of this.data)
		{
			if (tag.transactionFitsTag(_transaction)) return tag.id;
		}
		return false;
	}
}


		// let filter = [
		// 	[["description", "includes", "OV-chipkaart"]],
		// 	[["description", "includes",  "Lexkesveer"]],
		// ]

