import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ISupplyDataFunctions,
	NodeExecutionWithMetadata,
	SupplyData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import type { Embeddings } from '@langchain/core/embeddings';
import { insertFields } from './descriptions/insertFields';
import { loadFields } from './descriptions/loadFields';
import { updateFields } from './descriptions/updateFields';
import { retrieveFields } from './descriptions/retrieveFields';
import { retrieveAsToolFields } from './descriptions/retrieveAsToolFields';
import { handleInsertOperation } from './operations/insertOperation';
import { handleLoadOperation } from './operations/loadOperation';
import { handleUpdateOperation } from './operations/updateOperation';
import { handleRetrieveOperation } from './operations/retrieveOperation';
import { handleRetrieveAsToolOperation } from './operations/retrieveAsToolOperation';

export class ExampleVectorStore implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Example Vector Store',
		name: 'exampleVectorStore',
		description: 'Example Vector Store Node',
		group: ['transform'],
		version: 1,
		defaults: {
			name: 'Example Vector Store',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Vector Stores', 'Tools'],
				'Vector Stores': ['Other Vector Stores'],
				Tools: ['Other Tools'],
			},
		},
		credentials: [
			// This is where you define the credentials for the vector store.
			// You can remove this if your vector store does not require credentials.
			{
				name: 'exampleCredentialsApi',
				required: true,
			},
		],
		// This is how the inputs are defined for the vector store nodes.
		// It changes based on the operation mode selected. Do not change this unless you know what you are doing.
		inputs: `={{
			((parameters) => {
				const mode = parameters?.mode;
				const inputs = [{ displayName: "Embedding", type: "${NodeConnectionType.AiEmbedding}", required: true, maxConnections: 1}]

				if (mode === 'retrieve-as-tool') {
					return inputs;
				}

				if (['insert', 'load', 'update'].includes(mode)) {
					inputs.push({ displayName: "", type: "${NodeConnectionType.Main}"})
				}

				if (['insert'].includes(mode)) {
					inputs.push({ displayName: "Document", type: "${NodeConnectionType.AiDocument}", required: true, maxConnections: 1})
				}
				return inputs
			})($parameter)
		}}`,
		// This is how the outputs are defined for the vector store nodes.
		// It changes based on the operation mode selected. Do not change this unless you know what you are doing.
		outputs: `={{
			((parameters) => {
				const mode = parameters?.mode ?? 'retrieve';

				if (mode === 'retrieve-as-tool') {
					return [{ displayName: "Tool", type: "${NodeConnectionType.AiTool}"}]
				}

				if (mode === 'retrieve') {
					return [{ displayName: "Vector Store", type: "${NodeConnectionType.AiVectorStore}"}]
				}
				return [{ displayName: "", type: "${NodeConnectionType.Main}"}]
			})($parameter)
		}}`,
		properties: [
			// This is the operation mode selector for the vector store node.
			// It allows the user to select the operation mode for the vector store.
			{
				displayName: 'Operation Mode',
				name: 'mode',
				type: 'options',
				noDataExpression: true,
				default: 'retrieve',
				options: [
					{
						name: 'Get Many',
						value: 'load',
						description: 'Get many ranked documents from vector store for query',
						action: 'Get ranked documents from vector store',
					},
					{
						name: 'Insert Documents',
						value: 'insert',
						description: 'Insert documents into vector store',
						action: 'Add documents to vector store',
					},
					{
						name: 'Retrieve Documents (As Vector Store for Chain/Tool)',
						value: 'retrieve',
						description:
							'Retrieve documents from vector store to be used as vector store with AI nodes',
						action: 'Retrieve documents for Chain/Tool as Vector Store',
						outputConnectionType: NodeConnectionType.AiVectorStore,
					},
					{
						name: 'Retrieve Documents (As Tool for AI Agent)',
						value: 'retrieve-as-tool',
						description: 'Retrieve documents from vector store to be used as tool with AI nodes',
						action: 'Retrieve documents for AI Agent as Tool',
						outputConnectionType: NodeConnectionType.AiTool,
					},
					// TODO: Update operation might not be supported by the provider you are implementing.
					// If the provider does not support updating documents,
					// you can remove this option and the corresponding code in the `execute` function.
					{
						name: 'Update Documents',
						value: 'update',
						description: 'Update documents in vector store by ID',
						action: 'Update vector store documents',
					},
				],
			},
			// These are the fields for each operation mode.
			...insertFields,
			...loadFields,
			...updateFields,
			...retrieveFields,
			...retrieveAsToolFields,
		],
	};

	// This function is called when the node is executed in a workflow as a regular node.
	// It handles the `insert`, `load`, and `update` operations based on the mode selected.
	async execute(
		this: IExecuteFunctions,
	): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {
		const mode = this.getNodeParameter('mode', 0) as string;
		const embeddings = (await this.getInputConnectionData(
			NodeConnectionType.AiEmbedding,
			0,
		)) as Embeddings;
		if (mode === 'insert') {
			const resultData = await handleInsertOperation(this, embeddings);
			return [resultData];
		}

		if (mode === 'load') {
			const items = this.getInputData(0);
			const resultData: INodeExecutionData[] = [];
			for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
				const docs = await handleLoadOperation(this, embeddings, itemIndex);
				resultData.push(...docs);
			}
			return [resultData];
		}

		// TODO: Update operation might not be supporeted by the provider you are implementing.
		// If the provider does not support updating documents, you can remove this code and the operation from the node definition.
		if (mode === 'update') {
			const resultData = await handleUpdateOperation(this, embeddings);
			return [resultData];
		}

		throw new NodeOperationError(
			this.getNode(),
			'Only the "load", "update" and "insert" operation modes are supported with execute',
		);
	}

	// This function is called when the node is executed in a workflow to supply data to AI nodes.
	// It handles the `retrieve` and `retrieve-as-tool` operations based on the mode selected.
	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const mode = this.getNodeParameter('mode', 0);
		const embeddings = (await this.getInputConnectionData(
			NodeConnectionType.AiEmbedding,
			0,
		)) as Embeddings;
		if (mode === 'retrieve') {
			return await handleRetrieveOperation(this, embeddings, itemIndex);
		}

		if (mode === 'retrieve-as-tool') {
			return await handleRetrieveAsToolOperation(this, embeddings, itemIndex);
		}

		throw new NodeOperationError(
			this.getNode(),
			'Only the "retrieve" and "retrieve-as-tool" operation mode is supported to supply data',
		);
	}
}
