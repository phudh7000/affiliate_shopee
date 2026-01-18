import { BadRequestException, Injectable } from "@nestjs/common";
import { Conversation } from "src/mongodb/schema/Conversation.schema";
import { MainAgentService } from "../Agent/mainAgent.service";
import { AgentInputItem, run } from "@openai/agents";
import { PostContentAgentService } from "../Agent/postContentAgent.service";


@Injectable()
export class ChatbotService {
  constructor(
    private readonly mainAgentService: MainAgentService,
    private readonly postContentAgentService: PostContentAgentService,
  ) { }

  async getAffiliateContent(productDescription: string) {
    let result = await run(
      this.postContentAgentService.agent,
      productDescription
    );

    // console.log('usage: ', result.state._context.usage)
    // console.log('finalOutput: ', result.finalOutput)

    return result.finalOutput;
  }
}
//   async askChatbotNoStreaming(
//     question: string,
//     conversation_id?: string,
//   ) {
//     if (!question) {
//       throw new BadRequestException('question must be string');
//     }

//     if (question.length > 2000) {
//       throw new BadRequestException(
//         'Question cannot be longer than 2000 characters',
//       );
//     }

//     console.log('asking...')
//     let thread: AgentInputItem[] = [];
//     let conversation: Conversation | null = null;

//     if (conversation_id) {
//       conversation = await this.conversationModel.findOne({
//         _id: conversation_id
//       })

//       if (conversation && conversation.status == false) {
//         // sendMessage("🔔 Khách cũ nhắn, chatbot bỏ qua");
//         return "Chatbot handoff to human";
//       }
//       // console.log({ conversation })
//       if (conversation?.thread) {
//         thread = conversation.thread
//       }
//     }

//     if (!conversation) {
//       conversation = await this.conversationModel.insertOne({
//         conversation_name: question,
//       })
//     }


//     let result = await run(
//       this.mainAgentService.mainAgent,
//       thread.concat({ role: 'user', content: [{ type: 'input_text', text: question }] }),
//       // [{ role: 'user', content: [{ type: 'input_text', text: question }] }],
//     );

//     console.log('usage: ', result.state._context.usage)
//     console.log('finalOutput: ', result.finalOutput)
//     // console.log('result: ', result)

//     if (result?.state?._generatedItems?.length) {
//       for (const item of result?.state?._generatedItems) {
//         if (item.type == 'tool_call_output_item') {
//           if (item.rawItem.type == "function_call_result") {
//             if (item.rawItem.output.type == "text" && item.rawItem.output.text.includes('handoff')) {
//               await this.handoffConversationToHuman(conversation.id);
//               return item.rawItem.output.text;
//             }
//           }
//         }
//       }
//     }
//     // return {
//     //   conversation_id: conversation.id,
//     //   message: result.finalOutput
//     // };

//     // console.log('history: ', result.history)
//     thread = result.history;

//     try {
//       const updated = await this.conversationModel.updateOne({ _id: conversation.id }, {
//         thread
//       })

//       console.log({ updated })
 
//     } catch (error) {
//       console.log(error)
//     }

//     return {
//       conversation_id: conversation.id,
//       message: result.finalOutput
//     };

//   }

//   async getConverstationContent(converstationId: string) {
//     const conversation = await this.conversationModel.findById(converstationId);

//     const conversation_history: any = [];
//     if (conversation?.thread) {
//       for (const item of conversation.thread) {
//         if (item.role == 'user' || item.role == 'assistant') {
//           conversation_history.push({
//             [item.role]: item?.content[0].text,
//           })
//         }
//       }
//     }

//     return conversation_history;
//   }

//   async handoffConversationToHuman(conversation_id: string) {
//     return await this.conversationModel.updateOne({
//       id: conversation_id
//     }, {
//       status: false
//     })
//   }

//   async askChatbotStreaming(question: string,) {
//     if (!question) {
//       throw new BadRequestException('question must be string');
//     }

//     if (question.length > 2000) {
//       throw new BadRequestException(
//         'Question cannot be longer than 2000 characters',
//       );
//     }

//     const conversation_content: AgentInputItem[] = [];
//     conversation_content.push({ role: 'user', content: [{ type: 'input_text', text: question }] })

//     let result = await run(
//       this.mainAgentService.mainAgent,
//       conversation_content,
//       // [{ role: 'user', content: [{ type: 'input_text', text: question }] }],
//       {
//         stream: true,

//       },
//     );

//     try {
//       for await (const event of result) {
//         // these are the raw events from the model
//         if (event.type === 'raw_model_stream_event') {
//           // console.log(`${event.type} %o`, event.data);
//           if ((event.data.type = 'output_text_delta')) {
//             if (event.data['delta']) {
//               process.stdout.write(event.data['delta']);

//             }
//           }
//         }
//         // agent updated events
//         if (event.type === 'agent_updated_stream_event') {
//           // console.log(`${event.type} %s`, event.agent.name);
//         }
//         // Agent SDK specific events
//         if (event.type === 'run_item_stream_event') {
//           if (event.item.type === 'message_output_item') {
//             if (event.item?.rawItem?.status === 'completed') {
//               // console.log('\nstatus: ', event.item.rawItem.status)
//             }
//           }
//           // console.log(`${event.type} %o`, event.item);
//         }
//       }
//     } catch (error) {
//       console.log(error)
//     }
//   }
// }