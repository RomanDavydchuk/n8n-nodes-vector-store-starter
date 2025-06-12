import type { Embeddings } from '@langchain/core/embeddings';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getVectorStoreClient } from '../core/getVectorStoreClient';
import { processDocument } from '../shared/processDocument';
import { N8nJsonLoader } from '../shared/N8nJsonLoader';

// This function handles the update operation for the vector store.
// It processes the input documents, serializes them, and updates the vector store with the processed documents.
// Note that the provider you are implementing might not support updating documents, in that case
// you can remove this operation from the node definition and the code will not be executed.
export async function handleUpdateOperation(
	context: IExecuteFunctions,
	embeddings: Embeddings,
): Promise<INodeExecutionData[]> {
	const items = context.getInputData();
	const loader = new N8nJsonLoader(context);
	const resultData: INodeExecutionData[] = [];
	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		const itemData = items[itemIndex];
		const documentId = context.getNodeParameter('id', itemIndex, '', {
			extractValue: true,
		}) as string;
		const vectorStore = await getVectorStoreClient(context, undefined, embeddings, itemIndex);
		const { processedDocuments, serializedDocuments } = await processDocument(
			loader,
			itemData,
			itemIndex,
		);
		if (processedDocuments?.length !== 1) {
			throw new NodeOperationError(context.getNode(), 'Single document per item expected');
		}

		resultData.push(...serializedDocuments);
		await vectorStore.addDocuments(processedDocuments, {
			ids: [documentId],
		});
	}

	return resultData;
}
