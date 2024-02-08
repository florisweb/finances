
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

const AIManager = new class extends DataManager {
	batchSize = 40;
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
		let tagIdSet = new Set();
		for (let transaction of transactions) tagIdSet.add(transaction.typeCode);
		tagIds = [];
		tagIdSet.forEach(a => tagIds.push(a));
		
		let IBANSet = new Set();
		for (let transaction of transactions) IBANSet.add(transaction.targetIBAN);
		IBANs = [];
		IBANSet.forEach(a => IBANs.push(a));


		inputCount = moneyPropInputCount + IBANs.length;
		
		// Create a new network if it does not yet exist
		if (!this.data[0]) this.data[0] = new NeuralNetwork([inputCount, 20, 20, 10, tagIds.length]); 
		this.#dataPoints = transactions.map(transaction => this.#transactionToDataPoint(transaction));
		this.training = true;
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

	#train() {
		if (!this.#training) return;
		this.trainBatch();

		requestAnimationFrame(() => this.#train());
	}

	#curBatchIndex = 0;
	#totalBatches = 0;
	trainBatch() {
		if (this.#curBatchIndex + this.batchSize >= this.#dataPoints.length) this.#curBatchIndex = 0;

		let copyPoints = Object.assign([], this.#dataPoints);
		let batch = copyPoints.splice(this.#curBatchIndex, this.batchSize);
		this.#curBatchIndex++;
		this.#totalBatches++;

		this.tagClassifierNetwork.trainSet(batch);

		if (this.tagClassifierNetwork.trainingUpdates % 100 === 0) this.writeData();
	}


	calcSampleError(_samples = 100) {
		let arr = []; 
		for (let i = 0; i < _samples; i++) arr.push(this.#dataPoints[Math.floor(this.#dataPoints.length * Math.random())]);
		return this.tagClassifierNetwork.calcSetError(arr);
	}
	
	get succesPercentage() {
		return TransactionManager.data.map((ts) => ts.predictedTag?.id === ts.typeCode).reduce((a, b) => a + b, 0) / TransactionManager.data.length;
	}


	predictTag(_transaction) {
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

		return TagManager.getById(tagIds[tagIndex]);
	}

	


	transactionToInputMatrix(_transaction) {
		let delta = _transaction.deltaMoney;
		let inArr = [[delta < 0 ? 0 : 1]];
		for (let i = 1; i < moneyPropInputCount; i++) inArr.push([0]);
		inArr[Math.floor(Math.log10(Math.abs(delta))) + 1] = [1];

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
}



export default AIManager;