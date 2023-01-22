

const TagManager = new class {
	tags = [
		new TransactionTag({id: 0, name: '---', 						color: new Color('rgba(0, 0, 0, 0)')}),
		new TransactionTag({id: 1, name: 'kamer', 						color: new Color('#f00'), 
			filter: (t) => t.targetName.includes('GAMMA') || (t.targetName.includes('Idealis') && t.description.includes('Periode:'))
		}),
		new TransactionTag({id: 2, name: 'kleding', 					color: new Color('#0f0')}),
		new TransactionTag({id: 3, name: 'studie', 						color: new Color('#00f'), 
			filter: (t) => t.targetName.includes('proefschriftmaken') || t.targetName.includes('Studystore') || t.targetName.includes('Bruna') || t.description.includes('BRUNA')
		}),
		new TransactionTag({id: 4, name: 'eten', 						color: new Color('#'),
			filter: (t) => t.description.includes('Jumbo') || t.description.includes('Goudreinet') || t.description.includes('Spar') || t.description.includes('Brood') || t.description.includes('Bakker')
		}),
		new TransactionTag({id: 5, name: 'verenigingen', 				color: new Color('#'),
			filter: (t) => t.targetName.includes('Muziekprodukties') || t.targetName.includes('KENKON') || t.targetName.includes('BUDO KAI TORA TORA')
		}),
		new TransactionTag({id: 6, name: 'verzekeringen', 				color: new Color('#'),
			filter: (t) => t.targetName.includes('Centraal Beheer') || t.targetName.includes('Zilveren Kruis Zorgverzekeringen') || t.description.includes('VOORSCHOT ZORGTOESLAG')
		}),
		new TransactionTag({id: 7, name: 'overig', 						color: new Color('#')}),
		new TransactionTag({id: 8, name: 'werkEnOverigeInkomsten',  	color: new Color('#'), 
			filter: (t) => t.targetName.includes('Persoonality') || t.description.includes('Rente over positief saldo')
		}),
		new TransactionTag({id: 9, name: 'ouderVergoeding', 			color: new Color('#'),
			filter: (t) => t.description.includes('maandelijkse leef- en studievergoeding (uitwonend)')
		}),
		new TransactionTag({id: 10, name: 'uitgaanPresentjesEnVervoer', color: new Color('#'),
			filter: (t) => t.description.includes('OV-chipkaart') || t.description.includes('Lexkesveer')
		}),

		new TransactionTag({id: 11, name: 'corridor', 					color: new Color('#'),
			filter: (t) => t.description.includes('Corridor 15B') || t.description.includes('HOEVESTEIN 239 15B')
		}),
		new TransactionTag({id: 12, name: 'telefoonEnNonHobbyTech', 	color: new Color('#'),
			filter: (t) => t.description.includes('Lebara') || t.targetName.includes('Lebara')
		}),
	];


	autoDetectTransactionTag(_transaction) {
		for (let tag of this.tags)
		{
			if (tag.transactionFitsTag(_transaction)) return tag.id;
		}
		return false;
	}
}
					
					


