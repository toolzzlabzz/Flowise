import { Embeddings } from '@langchain/core/embeddings'
import { SupabaseLibArgs, SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { createClient } from '@supabase/supabase-js'
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils'
import { ICommonObject, INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'

class Supabase_Existing_VectorStores implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    badge: string
    baseClasses: string[]
    inputs: INodeParams[]
    credential: INodeParams
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'Supabase Load Existing Index'
        this.name = 'supabaseExistingIndex'
        this.version = 1.0
        this.type = 'Supabase'
        this.icon = 'supabase.svg'
        this.category = 'Vector Stores'
        this.description = 'Carregar índice existente do Supabase'
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever']
        this.badge = 'DEPRECATING'
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['supabaseApi']
        }
        this.inputs = [
            {
                label: 'Embeddings',
                name: 'embeddings',
                type: 'Embeddings'
            },
            {
                label: 'Supabase Project URL',
                name: 'supabaseProjUrl',
                type: 'string'
            },
            {
                label: 'Table Name',
                name: 'tableName',
                type: 'string'
            },
            {
                label: 'Query Name',
                name: 'queryName',
                type: 'string'
            },
            {
                label: 'Supabase Metadata Filter',
                name: 'supabaseMetadataFilter',
                type: 'json',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top K',
                name: 'topK',
                description: 'Number of top results to fetch. Default to 4',
                placeholder: '4',
                type: 'number',
                additionalParams: true,
                optional: true
            }
        ]
        this.outputs = [
            {
                label: 'Supabase Retriever',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Supabase Vector Store',
                name: 'vectorStore',
                baseClasses: [this.type, ...getBaseClasses(SupabaseVectorStore)]
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const supabaseProjUrl = nodeData.inputs?.supabaseProjUrl as string
        const tableName = nodeData.inputs?.tableName as string
        const queryName = nodeData.inputs?.queryName as string
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const supabaseMetadataFilter = nodeData.inputs?.supabaseMetadataFilter
        const output = nodeData.outputs?.output as string
        const topK = nodeData.inputs?.topK as string
        const k = topK ? parseFloat(topK) : 4

        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        const supabaseApiKey = getCredentialParam('supabaseApiKey', credentialData, nodeData)

        const client = createClient(supabaseProjUrl, supabaseApiKey)

        const obj: SupabaseLibArgs = {
            client,
            tableName,
            queryName
        }

        if (supabaseMetadataFilter) {
            const metadatafilter = typeof supabaseMetadataFilter === 'object' ? supabaseMetadataFilter : JSON.parse(supabaseMetadataFilter)
            obj.filter = metadatafilter
        }

        const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, obj)

        if (output === 'retriever') {
            const retriever = vectorStore.asRetriever(k)
            return retriever
        } else if (output === 'vectorStore') {
            ;(vectorStore as any).k = k
            return vectorStore
        }
        return vectorStore
    }
}

module.exports = { nodeClass: Supabase_Existing_VectorStores }
