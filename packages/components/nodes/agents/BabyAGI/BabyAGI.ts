import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { VectorStore } from '@langchain/core/vectorstores'
import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { BabyAGI } from './core'

class BabyAGI_Agents implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'BabyAGI'
        this.name = 'babyAGI'
        this.version = 1.0
        this.type = 'BabyAGI'
        this.category = 'Agents'
        this.icon = 'babyagi.svg'
        this.description = 'Agente autônomo orientado a tarefas que cria novas tarefas e reprioriza a lista de tarefas com base no objetivo'
        this.baseClasses = ['BabyAGI']
        this.inputs = [
            {
                label: 'Chat Model',
                name: 'model',
                type: 'BaseChatModel'
            },
            {
                label: 'Vector Store',
                name: 'vectorStore',
                type: 'VectorStore'
            },
            {
                label: 'Task Loop',
                name: 'taskLoop',
                type: 'number',
                default: 3
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseChatModel
        const vectorStore = nodeData.inputs?.vectorStore as VectorStore
        const taskLoop = nodeData.inputs?.taskLoop as string
        const k = (vectorStore as any)?.k ?? 4

        const babyAgi = BabyAGI.fromLLM(model, vectorStore, parseInt(taskLoop, 10), k)
        return babyAgi
    }

    async run(nodeData: INodeData, input: string): Promise<string> {
        const executor = nodeData.instance as BabyAGI
        const objective = input

        const res = await executor.call({ objective })
        return res
    }
}

module.exports = { nodeClass: BabyAGI_Agents }
