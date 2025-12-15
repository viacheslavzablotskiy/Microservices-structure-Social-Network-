import { Controller, Get } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {Channel, ConsumeMessage} from 'amqplib'
import { InvalidateCommentService } from 'src/providers/inv_comment.service';

@Controller()
export class InvalidateCommentController {
  constructor(
    private readonly invalidateCommentService: InvalidateCommentService
  ) {}


  @EventPattern('comment.count.key')
  async invalidate_comment_cache_after_delete_post_or_comment_itself(
    @Payload() data: {postId: number}, @Ctx() context: RmqContext
  ): Promise<void> {
    const channel:Channel = context.getChannelRef()
    const message = context.getMessage() as ConsumeMessage

    try {
      await this.invalidateCommentService.delCommentCountCache(data.postId)
      
      channel.ack(message)

    } catch (error) {
      channel.nack(message, false, false)
    }
  }

  @EventPattern('comment.page.key')
  async invalidate_comment_cache_page_after_some_aciton(
    @Payload() data: {postId: number}, @Ctx() context: RmqContext
  ): Promise<void> {
    const channel: Channel = context.getChannelRef()
    const message = context.getMessage() as ConsumeMessage

    try {
      await this.invalidateCommentService.delCommentPageCache(data.postId)

      channel.ack(message)
    } catch (error) {
      channel.nack(message, false, false)
    }
  }
}
