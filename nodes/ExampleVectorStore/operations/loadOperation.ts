import { Embeddings } from '@langchain/core/embeddings';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { getVectorStoreClient } from '../core/getVectorStoreClient';
import { getMetadataFiltersValues } from '../shared/helpers';

// This function handles the load operation for the vector store.
// It retrieves documents based on a similarity search using the provided embeddings and prompt.
export async function handleLoadOperation(
	context: IExecuteFunctions,
	embeddings: Embeddings,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const filter = getMetadataFiltersValues(context, itemIndex);
	const vectorStore = await getVectorStoreClient(context, undefined, embeddings, itemIndex);
	const prompt = context.getNodeParameter('prompt', itemIndex) as string;
	const topK = context.getNodeParameter('topK', itemIndex, 4) as number;
	const includeDocumentMetadata = context.getNodeParameter(
		'includeDocumentMetadata',
		itemIndex,
		true,
	) as boolean;
	const embeddedPrompt = await embeddings.embedQuery(prompt);
	const docs = await vectorStore.similaritySearchVectorWithScore(embeddedPrompt, topK, filter);
	const serializedDocs = docs.map(([doc, score]) => {
		const document = {
			pageContent: doc.pageContent,
			...(includeDocumentMetadata ? { metadata: doc.metadata } : {}),
		};
		return {
			json: { document, score },
			pairedItem: {
				item: itemIndex,
			},
		};
	});

	return serializedDocs;
}
