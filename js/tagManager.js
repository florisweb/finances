

const TagManager = new class {
	tags = [
		new TransactionTag({id: 0, name: '---', 						color: new Color('rgba(0, 0, 0, 0)')}),
		new TransactionTag({id: 1, name: 'Kamer', 						color: new Color('rgb(106, 153, 208)'), 
			filter: (t) => t.targetName.includes('GAMMA') || (t.targetName.includes('Idealis') && t.description.includes('Periode:'))
		}),
		new SavingsTransactionTag({id: 2, name: 'Kleding', color: new Color('rgb(222, 131, 68)'), startValue: 282,
			filter: (t) => t.description.includes('Modeschoenen') || t.description.includes('Good Looking') || t.targetName.includes('C&A')
		}),
		new SavingsTransactionTag({id: 3, name: 'Studie', color: new Color('rgb(245, 194, 66)'), startValue: 77.02,
			filter: (t) => t.targetName.includes('proefschriftmaken') || t.targetName.includes('Studystore') || t.targetName.includes('Bruna') || t.description.includes('BRUNA') || t.targetName.includes('Wageningen Universiteit') || t.targetName.includes('SURFspot')
		}),
		new TransactionTag({id: 4, name: 'Eten', 						color: new Color('rgb(126, 171, 85)'),
			filter: (t) => t.description.includes('Jumbo') || t.description.includes('Goudreinet') || t.description.includes('Spar') || t.description.includes('Brood') || t.description.includes('Bakker') || t.description.includes('Ekoplaza') || t.description.includes('Bosveld') || t.description.includes('Gino') || t.description.includes('ALBERT HEIJN') || t.description.includes('Natuurwinkel') || t.description.includes('Coop') || t.description.includes('Lidl')
		}),
		new TransactionTag({id: 5, name: 'Verenigingen', 				color: new Color('rgb(104, 52, 154)'),
			filter: (t) => t.targetName.includes('Muziekprodukties') || t.targetName.includes('KENKON') || t.targetName.includes('BUDO KAI TORA TORA')
		}),
		new TransactionTag({id: 6, name: 'Verzekeringen', 				color: new Color('rgb(136, 150, 174)'),
			filter: (t) => t.targetName.includes('Centraal Beheer') || t.targetName.includes('Zilveren Kruis Zorgverzekeringen') || t.description.includes('VOORSCHOT ZORGTOESLAG') || t.targetName.includes('INFOMEDICS')
		}),
		new TransactionTag({id: 8, name: 'WerkEnOverigeInkomsten',  	color: new Color('rgb(117, 251, 106)'), 
			filter: (t) => t.targetName.includes('Persoonality') || t.description.includes('Rente over positief saldo') || t.targetName.includes('DUO Hoofdrekening') || t.description.includes('CREDITRENTE')
		}),
		new TransactionTag({id: 9, name: 'OuderVergoeding', 			color: new Color('rgb(117, 251, 189)'),
			filter: (t) => t.description.includes('maandelijkse leef- en studievergoeding (uitwonend)') || t.description.includes('zakgeld') || t.description.includes('maandelijkse leef- en studievergoeding (thuiswonend)')
		}),
		new SavingsTransactionTag({id: 10, name: 'UitgaanPresentjesEnVervoer', color: new Color('rgb(230, 50, 247)'), 
			filter: (t) => t.description.includes('OV-chipkaart') || t.description.includes('Lexkesveer')
		}),
		new SavingsTransactionTag({id: 11, name: 'Corridor', color: new Color('rgb(219, 225, 240)'), startValue: 250.43,
			filter: (t) => t.description.includes('Corridor 15B') || t.description.includes('HOEVESTEIN 239 15B')
		}),
		new SavingsTransactionTag({id: 12, name: 'TelefoonEnNonHobbyTech', 	color: new Color('rgb(128, 128, 128)'),
			filter: (t) => t.description.includes('Lebara') || t.targetName.includes('Lebara')
		}),
		new TransactionTag({id: 7, name: 'Overig', 						color: new Color('rgb(158, 205, 251)')}),
	];


	autoDetectTransactionTag(_transaction) {
		for (let tag of this.tags)
		{
			if (tag.transactionFitsTag(_transaction)) return tag.id;
		}
		return false;
	}
}
					
					


