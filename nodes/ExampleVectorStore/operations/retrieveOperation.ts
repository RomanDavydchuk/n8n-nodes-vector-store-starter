import type { Embeddings } from '@langchain/core/embeddings';
import { type ISupplyDataFunctions, type SupplyData } from 'n8n-workflow';
import { getVectorStoreClient } from '../core/getVectorStoreClient';
import { logWrapper } from '../shared/logWrapper';
import { getMetadataFiltersValues } from '../shared/helpers';

// This function handles the retrieve operation for the vector store.
// It gets and returns the vector store client based on the provided metadata filters and embeddings.
// This vector store client can then be used by the Vector Store Question Answer Tool.
export async function handleRetrieveOperation(
	context: ISupplyDataFunctions,
	embeddings: Embeddings,
	itemIndex: number,
): Promise<SupplyData> {
	const filter = getMetadataFiltersValues(context, itemIndex);
	const vectorStore = await getVectorStoreClient(context, filter, embeddings, itemIndex);
	return {
		response: logWrapper(vectorStore, context),
	};
}
