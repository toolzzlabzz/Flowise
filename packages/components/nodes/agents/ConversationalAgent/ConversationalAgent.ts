import { flatten } from 'lodash'
import { Tool } from '@langchain/core/tools'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages'
import { ChainValues } from '@langchain/core/utils/types'
import { AgentStep } from '@langchain/core/agents'
import { renderTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { ChatConversationalAgent } from 'langchain/agents'
import { getBaseClasses } from '../../../src/utils'
import { ConsoleCallbackHandler, CustomChainHandler, additionalCallbacks } from '../../../src/handler'
import { FlowiseMemory, ICommonObject, IMessage, INode, INodeData, INodeParams } from '../../../src/Interface'
import { AgentExecutor } from '../../../src/agents'
import { ChatOpenAI } from '../../chatmodels/ChatOpenAI/FlowiseChatOpenAI'
import { addImagesToMessages } from '../../../src/multiModalUtils'

const DEFAULT_PREFIX = `Assistant is a large language model trained by OpenAI.

Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.

Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.

Overall, Assistant is a powerful system that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.`

const TEMPLATE_TOOL_RESPONSE = `TOOL RESPONSE:
---------------------
{observation}

USER'S INPUT
--------------------

Okay, so what is the response to my last comment? If using information obtained from the tools you must mention it explicitly without mentioning the tool names - I have forgotten all TOOL RESPONSES! Remember to respond with a markdown code snippet of a json blob with a single action, and NOTHING else.`

class ConversationalAgent_Agents implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]
    sessionId?: string

    constructor(fields?: { sessionId?: string }) {
        this.label = 'Conversational Agent'
        this.name = 'conversationalAgent'
        this.version = 2.0
        this.type = 'AgentExecutor'
        this.category = 'Agents'
        this.icon = 'agent.svg'
        this.description = 'Agente conversacional para um modelo de chat. Ele utilizará prompts específicos de bate-papo'
        this.baseClasses = [this.type, ...getBaseClasses(AgentExecutor)]
        this.inputs = [
            {
                label: 'Allowed Tools',
                name: 'tools',
                type: 'Tool',
                list: true
            },
            {
                label: 'Chat Model',
                name: 'model',
                type: 'BaseChatModel'
            },
            {
                label: 'Memory',
                name: 'memory',
                type: 'BaseChatMemory'
            },
            {
                label: 'System Message',
                name: 'systemMessage',
                type: 'string',
                rows: 4,
                default: DEFAULT_PREFIX,
                optional: true,
                additionalParams: true
            }
        ]
        this.sessionId = fields?.sessionId
    }

    async init(nodeData: INodeData, input: string, options: ICommonObject): Promise<any> {
        return prepareAgent(nodeData, options, { sessionId: this.sessionId, chatId: options.chatId, input }, options.chatHistory)
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const memory = nodeData.inputs?.memory as FlowiseMemory

        const executor = await prepareAgent(
            nodeData,
            options,
            { sessionId: this.sessionId, chatId: options.chatId, input },
            options.chatHistory
        )

        const loggerHandler = new ConsoleCallbackHandler(options.logger)
        const callbacks = await additionalCallbacks(nodeData, options)

        let res: ChainValues = {}

        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId)
            res = await executor.invoke({ input }, { callbacks: [loggerHandler, handler, ...callbacks] })
        } else {
            res = await executor.invoke({ input }, { callbacks: [loggerHandler, ...callbacks] })
        }

        await memory.addChatMessages(
            [
                {
                    text: input,
                    type: 'userMessage'
                },
                {
                    text: res?.output,
                    type: 'apiMessage'
                }
            ],
            this.sessionId
        )

        return res?.output
    }
}

const prepareAgent = async (
    nodeData: INodeData,
    options: ICommonObject,
    flowObj: { sessionId?: string; chatId?: string; input?: string },
    chatHistory: IMessage[] = []
) => {
    const model = nodeData.inputs?.model as BaseChatModel
    let tools = nodeData.inputs?.tools as Tool[]
    tools = flatten(tools)
    const memory = nodeData.inputs?.memory as FlowiseMemory
    const systemMessage = nodeData.inputs?.systemMessage as string
    const memoryKey = memory.memoryKey ? memory.memoryKey : 'chat_history'
    const inputKey = memory.inputKey ? memory.inputKey : 'input'

    const outputParser = ChatConversationalAgent.getDefaultOutputParser({
        llm: model,
        toolNames: tools.map((tool) => tool.name)
    })

    const prompt = ChatConversationalAgent.createPrompt(tools, {
        systemMessage: systemMessage ? systemMessage : DEFAULT_PREFIX,
        outputParser
    })

    if (model instanceof ChatOpenAI) {
        let humanImageMessages: HumanMessage[] = []
        const messageContent = addImagesToMessages(nodeData, options, model.multiModalOption)

        if (messageContent?.length) {
            // Change model to gpt-4-vision
            model.modelName = 'gpt-4-vision-preview'

            // Change default max token to higher when using gpt-4-vision
            model.maxTokens = 1024

            for (const msg of messageContent) {
                humanImageMessages.push(new HumanMessage({ content: [msg] }))
            }

            // Pop the `agent_scratchpad` MessagePlaceHolder
            let messagePlaceholder = prompt.promptMessages.pop() as MessagesPlaceholder

            // Add the HumanMessage for images
            prompt.promptMessages.push(...humanImageMessages)

            // Add the `agent_scratchpad` MessagePlaceHolder back
            prompt.promptMessages.push(messagePlaceholder)
        } else {
            // revert to previous values if image upload is empty
            model.modelName = model.configuredModel
            model.maxTokens = model.configuredMaxToken
        }
    }

    /** Bind a stop token to the model */
    const modelWithStop = model.bind({
        stop: ['\nObservation']
    })

    const runnableAgent = RunnableSequence.from([
        {
            [inputKey]: (i: { input: string; steps: AgentStep[] }) => i.input,
            agent_scratchpad: async (i: { input: string; steps: AgentStep[] }) => await constructScratchPad(i.steps),
            [memoryKey]: async (_: { input: string; steps: AgentStep[] }) => {
                const messages = (await memory.getChatMessages(flowObj?.sessionId, true, chatHistory)) as BaseMessage[]
                return messages ?? []
            }
        },
        prompt,
        modelWithStop,
        outputParser
    ])

    const executor = AgentExecutor.fromAgentAndTools({
        agent: runnableAgent,
        tools,
        sessionId: flowObj?.sessionId,
        chatId: flowObj?.chatId,
        input: flowObj?.input,
        verbose: process.env.DEBUG === 'true'
    })

    return executor
}

const constructScratchPad = async (steps: AgentStep[]): Promise<BaseMessage[]> => {
    const thoughts: BaseMessage[] = []
    for (const step of steps) {
        thoughts.push(new AIMessage(step.action.log))
        thoughts.push(
            new HumanMessage(
                renderTemplate(TEMPLATE_TOOL_RESPONSE, 'f-string', {
                    observation: step.observation
                })
            )
        )
    }
    return thoughts
}

module.exports = { nodeClass: ConversationalAgent_Agents }
