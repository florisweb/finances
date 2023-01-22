

const TagManager = new class {
	tags = [
		new TransactionTag({id: 0, name: '---', 						color: new Color('rgba(0, 0, 0, 0)')}),
		new TransactionTag({id: 1, name: 'kamer', 						color: new Color('rgb(106, 153, 208)'), 
			filter: (t) => t.targetName.includes('GAMMA') || (t.targetName.includes('Idealis') && t.description.includes('Periode:'))
		}),
		new TransactionTag({id: 2, name: 'kleding', 					color: new Color('rgb(222, 131, 68)'),
			filter: (t) => t.targetName.includes('Modeschoenen')
		}),
		new TransactionTag({id: 3, name: 'studie', 						color: new Color('rgb(245, 194, 66)'), 
			filter: (t) => t.targetName.includes('proefschriftmaken') || t.targetName.includes('Studystore') || t.targetName.includes('Bruna') || t.description.includes('BRUNA')
		}),
		new TransactionTag({id: 4, name: 'eten', 						color: new Color('rgb(126, 171, 85)'),
			filter: (t) => t.description.includes('Jumbo') || t.description.includes('Goudreinet') || t.description.includes('Spar') || t.description.includes('Brood') || t.description.includes('Bakker') || t.description.includes('Ekoplaza') || t.description.includes('Bosveld') || t.description.includes('Gino') || t.description.includes('ALBERT HEIJN') || t.description.includes('Natuurwinkel') || t.description.includes('Coop') || t.description.includes('Lidl')
		}),
		new TransactionTag({id: 5, name: 'verenigingen', 				color: new Color('rgb(104, 52, 154)'),
			filter: (t) => t.targetName.includes('Muziekprodukties') || t.targetName.includes('KENKON') || t.targetName.includes('BUDO KAI TORA TORA')
		}),
		new TransactionTag({id: 6, name: 'verzekeringen', 				color: new Color('rgb(136, 150, 174)'),
			filter: (t) => t.targetName.includes('Centraal Beheer') || t.targetName.includes('Zilveren Kruis Zorgverzekeringen') || t.description.includes('VOORSCHOT ZORGTOESLAG')
		}),
		new TransactionTag({id: 7, name: 'overig', 						color: new Color('rgb(158, 205, 251)')}),
		new TransactionTag({id: 8, name: 'werkEnOverigeInkomsten',  	color: new Color('rgb(117, 251, 106)'), 
			filter: (t) => t.targetName.includes('Persoonality') || t.description.includes('Rente over positief saldo') || t.targetName.includes('DUO Hoofdrekening') || t.description.includes('CREDITRENTE')
		}),
		new TransactionTag({id: 9, name: 'ouderVergoeding', 			color: new Color('rgb(117, 251, 189)'),
			filter: (t) => t.description.includes('maandelijkse leef- en studievergoeding (uitwonend)') || t.description.includes('zakgeld') || t.description.includes('maandelijkse leef- en studievergoeding (thuiswonend)')
		}),
		new TransactionTag({id: 10, name: 'uitgaanPresentjesEnVervoer', color: new Color('rgb(230, 50, 247)'),
			filter: (t) => t.description.includes('OV-chipkaart') || t.description.includes('Lexkesveer')
		}),

		new TransactionTag({id: 11, name: 'corridor', 					color: new Color('rgb(219, 225, 240)'),
			filter: (t) => t.description.includes('Corridor 15B') || t.description.includes('HOEVESTEIN 239 15B')
		}),
		new TransactionTag({id: 12, name: 'telefoonEnNonHobbyTech', 	color: new Color('rgb(128, 128, 128)'),
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
					
					


