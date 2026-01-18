import { Module } from "@nestjs/common";
import { MainAgentService } from "./mainAgent.service";
import { PostContentAgentService } from "./postContentAgent.service";


@Module({
  providers: [MainAgentService, PostContentAgentService],
  exports: [MainAgentService, PostContentAgentService]
})
export class AgentModule { }
