

const TagManager = new class {
	tags = [
		new TransactionTag({id: 1, name: 'kamer', 						color: new Color('#f00')}),
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
}