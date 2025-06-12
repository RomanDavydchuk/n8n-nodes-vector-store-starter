import type { Embeddings } from '@langchain/core/embeddings';
import type { Document } from '@langchain/core/documents';
import type { IExecuteFunctions, ISupplyDataFunctions } from 'n8n-workflow';

// This function is used to populate the vector store you are implementing with documents.
// It is called in the handler for the insert operation (`handleInsertOperation`).
export async function populateVectorStore(
	context: IExecuteFunctions | ISupplyDataFunctions,
	embeddings: Embeddings,
	documents: Array<Document<Record<string, unknown>>>,
	itemIndex: number,
): Promise<void> {
	// TODO: implement this function
	throw new Error('This function is not implemented yet. Please implement it in your node.');
}
