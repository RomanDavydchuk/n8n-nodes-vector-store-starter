import { INodeProperties } from 'n8n-workflow';

// Here are the fields that are specific to the update operation.
// The fields that are already defined here are used in the update operation handler (`handleUpdateOperation`).
// You can add more fields if needed, but make sure to update the handler accordingly.
export const updateFields: INodeProperties[] = [
	{
		displayName: 'ID',
		name: 'id',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of an embedding entry',
		displayOptions: {
			show: {
				mode: ['update'],
			},
		},
	},
	// TODO: add more fields, if needed
];
