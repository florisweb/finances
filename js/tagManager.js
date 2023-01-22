
const TagManager = new class {
	tags = [
		new TransactionTag({id: 0, name: '---', 						color: new Color('rgba(0, 0, 0, 0)')}),
		new TransactionTag({id: 1, name: 'kamer', 						color: new Color('#f00'), filter: (t) => t.targetName.includes('GAMMA') || (t.targetName.includes('Idealis') && t.description.includes('Periode:'))}),
		new TransactionTag({id: 2, name: 'kleding', 					color: new Color('#0f0')}),
		new TransactionTag({id: 3, name: 'studie', 						color: new Color('#00f')}),
		new TransactionTag({id: 4, name: 'eten', 						color: new Color('#')}),
		new TransactionTag({id: 5, name: 'verenigingen', 				color: new Color('#')}),
		new TransactionTag({id: 6, name: 'verzekeringen', 				color: new Color('#')}),
		new TransactionTag({id: 7, name: 'overig', 						color: new Color('#')}),
		new TransactionTag({id: 8, name: 'werkEnOverigeInkomsten',  	color: new Color('#')}),
		new TransactionTag({id: 9, name: 'ouderVergoeding', 			color: new Color('#')}),
		new TransactionTag({id: 10, name: 'uitgaanPresentjesEnVervoer', color: new Color('#')}),
		new TransactionTag({id: 11, name: 'corridor', 					color: new Color('#')}),
		new TransactionTag({id: 12, name: 'telefoonEnNonHobbyTech', 	color: new Color('#')}),
	];


	autoDetectTransactionTag(_transaction) {
		for (let tag of this.tags)
		{
			if (tag.transactionFitsTag(_transaction)) return tag.id;
		}
		return false;
	}
}


// 	let description = _transaction.description ? _transaction.description : '';
// 					let targetName = _transaction.targetName ? _transaction.targetName : '';

// 					if (description.includes('Rente over positief saldo')) return Types.werkEnOverigeInkomsten;
// 					if (targetName.includes('Persoonality')) return Types.werkEnOverigeInkomsten;


// 					if (description.includes('OV-chipkaart')) return Types.uitgaanPresentjesEnVervoer;
// 					if (description.includes('Lexkesveer')) return Types.uitgaanPresentjesEnVervoer;

					
// 					if (description.includes('Jumbo')) return Types.eten;
// 					if (description.includes('Goudreinet Wageningen')) return Types.eten;
// 					if (description.includes('Spar Citystore')) return Types.eten;
// 					if (description.includes('Broodbakkerij')) return Types.eten;
// 					if (description.includes('Bakker Bart')) return Types.eten;
// 					if (description.includes('Bakkerij')) return Types.eten;


// if (targetName.includes('proefschriftmaken')) return Types.studie;
// 					if (targetName.includes('Studystore')) return Types.studie;
// 					if (targetName.includes('STICHTING DERDENGELDEN BUCKAROO')) return Types.studie;
// 					if (description.includes('BRUNA') || targetName.includes('Bruna')) return Types.studie;


// 					if (targetName.includes('Fp Muziekprodukties')) return Types.verenigingen;
// 					if (targetName.includes('KENKON')) return Types.verenigingen;
					
					

// 					if (description.includes('Lebara')) return Types.telefoonEnNonHobbyTech;




// 					if (targetName.includes('Centraal Beheer')) return Types.verzekeringen;					
// 					if (description.includes('VOORSCHOT ZORGTOESLAG')) return Types.verzekeringen;
// 					if (targetName.includes('Zilveren Kruis Zorgverzekeringen')) return Types.verzekeringen;


// 					if (description.includes('maandelijkse leef- en studievergoeding (uitwonend)')) return Types.ouderVergoeding;
					
// 					if (description.includes('Corridor 15B')) return Types.corridor;
// 					if (description.includes('HOEVESTEIN 239 15B')) return Types.corridor;
