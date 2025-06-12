import { INodeProperties } from 'n8n-workflow';

// Here are the fields that are specific to the load operation.
// The fields that are already defined here are used in the load operation handler (`handleLoadOperation`).
// You can add more fields if needed, but make sure to update the handler accordingly.
export const loadFields: INodeProperties[] = [
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		default: '',
		required: true,
		description:
			'Search prompt to retrieve matching documents from the vector store using similarity-based ranking',
		displayOptions: {
			show: {
				mode: ['load'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'topK',
		type: 'number',
		default: 4,
		description: 'Number of top results to fetch from vector store',
		displayOptions: {
			show: {
				mode: ['load'],
			},
		},
	},
	{
		displayName: 'Include Metadata',
		name: 'includeDocumentMetadata',
		type: 'boolean',
		default: true,
		description: 'Whether or not to include document metadata',
		displayOptions: {
			show: {
				mode: ['load'],
			},
		},
	},
	// TODO: add more fields, if needed
];
