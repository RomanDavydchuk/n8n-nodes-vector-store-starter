import type { IExecuteFunctions, ISupplyDataFunctions } from 'n8n-workflow';
import { Embeddings } from '@langchain/core/embeddings';
import { VectorStore } from '@langchain/core/vectorstores';

// This function is used to get a `VectorStore` client
// for the provider you are implementing.
// It is called in the operations handlers, like `handleLoadOperation`, `handleRetrieveOperation`, etc.
export async function getVectorStoreClient<T extends VectorStore = VectorStore>(
	context: IExecuteFunctions | ISupplyDataFunctions,
	filter: Record<string, never> | undefined,
	embeddings: Embeddings,
	itemIndex: number,
): Promise<T> {
	// TODO: implement this function
	throw new Error('This function is not implemented yet. Please implement it in your node.');
}
