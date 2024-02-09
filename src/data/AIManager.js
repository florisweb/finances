
import NeuralNetwork from "../neuralNetwork";
import Matrix from '../matrix';
import TransactionManager from "./transactionManager";
import TagManager from "./tagManager";
import DataManager from "./dataManager";
import { wait } from '../polyfill';

const moneyPropInputCount = 6;
let inputCount;
let tagIds;
let IBANs = [];

const descriptionLength = 0;
const dictionary = 'abcdefghijklmnopqrstuvwxyz,.():-'.split('');


const AIManager = new class extends DataManager {
	batchSize = 50;
	get tagClassifierNetwork() {
		return this.data[0];
	};
	constructor() {
		super({type: 'neuralNetworks', dataToObject: (_network) => new NeuralNetwork().import(_network)});
		window.AIManager = this;
	}
	
	#dataPoints = [];

	async setup() {
		super.setup();
		while (!TransactionManager.isSetup) await wait(100);

		let transactions = TransactionManager.data;
		if (!transactions) return;
		let tagIdSet = new Set();
		for (let transaction of transactions) tagIdSet.add(transaction.typeCode);
		tagIds = [];
		tagIdSet.forEach(a => tagIds.push(a));
		
		let IBANSet = new Set();
		for (let transaction of transactions) IBANSet.add(transaction.targetIBAN);
		IBANs = [];
		IBANSet.forEach(a => IBANs.push(a));


		inputCount = moneyPropInputCount + IBANs.length + descriptionLength * dictionary.length;
		
		// Create a new network if it does not yet exist or has changed
		if (
			!this.data[0] || 
			this.data[0].layers[0].size !== inputCount ||
			this.data[0].layers[this.data[0].layers.length - 1].size !== tagIds.length 
		) this.data[0] = new NeuralNetwork([inputCount, 20, 20, 10, tagIds.length]); 
			

		this.#updateLearningRate();
		 

		this.#dataPoints = transactions.map(transaction => this.#transactionToDataPoint(transaction));
		this.training = true;
	}
	#updateLearningRate() {
		if (this.data[0].trainingUpdates > 10000) this.data[0].learningRate = .1;
		if (this.data[0].trainingUpdates > 50000) this.data[0].learningRate = .05;
		if (this.data[0].trainingUpdates > 100000) this.data[0].learningRate = .01;
	}
	
	#training = false;
	get training() {
		return this.#training;
	}
	set training(_newState) {
		let oldState = this.#training;
		this.#training = _newState;
		if (_newState && !oldState) this.#train();
	}

	async #train() {
		if (!this.#training) return;
		this.trainBatch();
		await wait(10);
		requestAnimationFrame(() => this.#train());
	}

	#curBatchIndex = 0;
	#totalBatches = 0;
	trainBatch() {
		if (!this.tagClassifierNetwork) return;
		if (this.#curBatchIndex + this.batchSize >= this.#dataPoints.length) this.#curBatchIndex = 0;

		let copyPoints = Object.assign([], this.#dataPoints);
		let batch = copyPoints.splice(this.#curBatchIndex, this.batchSize);
		this.#curBatchIndex++;
		this.#totalBatches++;

		this.tagClassifierNetwork.trainSet(batch);

		if (this.tagClassifierNetwork.trainingUpdates % 100 !== 0) return;
		this.writeData();
		this.#updateLearningRate();
	}


	calcSampleError(_samples = 100) {
		let arr = []; 
		for (let i = 0; i < _samples; i++) arr.push(this.#dataPoints[Math.floor(this.#dataPoints.length * Math.random())]);
		return this.tagClassifierNetwork.calcSetError(arr);
	}
	
	get succesPercentage() {
		let transactions = TransactionManager.data.filter(a => a.typeCode);
		return transactions.map((ts) => ts.predictedTag?.tag.id === ts.typeCode).reduce((a, b) => a + b, 0) / transactions.length;
	}


	predictTag(_transaction) {
		if (!this.tagClassifierNetwork) return;
		let input = this.transactionToInputMatrix(_transaction);
		let output = this.tagClassifierNetwork.calcOutput(input);
		
		let largestValue = 0;
		let tagIndex = 0;
		for (let i = 0; i < output.height; i++)
		{
			if (output.value[i][0] < largestValue) continue;
			largestValue = output.value[i][0];
			tagIndex = i;
		}
		
		let tag = TagManager.getById(tagIds[tagIndex]);
		if (!tag) return;
		if (largestValue < .3) return;
		return {
			tag: tag,
			certainty: largestValue,
		}
	}

	


	transactionToInputMatrix(_transaction) {
		let delta = _transaction.deltaMoney;
		let inArr = [[delta < 0 ? 0 : 1]];
		for (let i = 1; i < moneyPropInputCount; i++) inArr.push([0]);
		inArr[Math.floor(Math.log10(Math.abs(delta))) + 1] = [1];

		let descriptionArr = this.#descriptionToInputArray(_transaction.description);
		inArr = inArr.concat(descriptionArr);

		let IBANArr = [];
		for (let i = 0; i < IBANs.length; i++) IBANArr.push(IBANs[i] === _transaction.targetIBAN ? [1] : [0]);
		inArr = inArr.concat(IBANArr);

		return new Matrix(1, inputCount).fromArray(inArr);
	}

	#transactionToDataPoint(_transaction) {
		let outArr = [];
		for (let tag of tagIds) outArr.push(tag === _transaction.typeCode ? [1] : [0]);

		return {
			inputs: this.transactionToInputMatrix(_transaction),
			outputs: new Matrix(1, tagIds.length).fromArray(outArr)
		};
	}	

	#descriptionToInputArray(_text) {
		let text = _text.toLowerCase();
		let arr = [];
		for (let i = 0; i < dictionary.length * descriptionLength; i++) arr[i] = [0];

		let addedChars = 0;
		for (let char in text)
		{
			let index = dictionary.findIndex((v) => v === char);
			if (index === -1) continue;
			let realIndex = index + dictionary.length * addedChars;
			if (realIndex > arr.length) break;
			arr[realIndex] = [1];
			addedChars++;
		}
		return arr;
	}
}



export default AIManager;