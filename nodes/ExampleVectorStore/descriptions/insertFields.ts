import { INodeProperties } from 'n8n-workflow';

// Here are the fields that are specific to the insert operation.
// The fields that are already defined here are used in the insert operation handler (`handleInsertOperation`).
// You can add more fields if needed, but make sure to update the handler accordingly.
export const insertFields: INodeProperties[] = [
	{
		displayName: 'Embedding Batch Size',
		name: 'embeddingBatchSize',
		type: 'number',
		default: 200,
		description: 'Number of documents to embed in a single batch',
		displayOptions: {
			show: {
				mode: ['insert'],
			},
		},
	},
	// TODO: add more fields, if needed
];
