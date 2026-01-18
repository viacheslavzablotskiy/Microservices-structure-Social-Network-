import { Controller, Post, Get, Query, Body, UseGuards, Patch, Delete, Param, Req, UnauthorizedException, UseInterceptors} from "@nestjs/common";
import {MainPostService} from '../providers/post.service'
import { JWTAuthGuard, ZodValidationPipe } from "@repo/api";
import {CreationPostDataSchema, type CreationPostDataType, UpdatetingPostDataSchema,
     type UpdatePostDataType, DeletePostDataSchema, type DeletePostDataType,
     Post_Entity} from '@repo/user-interfaces'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiNotAcceptableResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBearerAuth, ApiCookieAuth } from "@nestjs/swagger";
import { CretionNewPostSwagger, DeletePostSwagger, Post_Entity_Swagger, UpdationPostSwagger } from "src/documentation_classes/post.swagger";
import { type Request } from "express";
import { TimersIntercertor } from "src/settings/main.interceptors";

@ApiTags('post')
@Controller('post')
export class MainPostCOntriller {
    
    constructor(private readonly postService: MainPostService) {}

    @ApiCookieAuth()
    @ApiBearerAuth('auth-part')
    @UseGuards(JWTAuthGuard)
    @Get()
    @ApiOperation({summary: 'get portion of the post', description: 'get some data after id key'})
    @ApiQuery({name: 'after', type: String, required: false, description: 'id last post'})
    @ApiOkResponse({type: Post_Entity_Swagger, isArray: true, description: 'you got this data'})
    @UseInterceptors(TimersIntercertor)
    async getInitialOrSomeData(
        @Req() req: Request,
        @Query('after') after?: string
    ) {
        if (!req.user) throw new UnauthorizedException('YOU DONT HAVE PERMISSION')

        if (!after) {
            return await this.postService.getInitialPostsData(req.user.userId)
        } 
        else {
            return await this.postService.getOtherPartOfData({lastId: Number(after), reqUser: req.user.userId})
        }
    }

    @ApiCookieAuth()
    @ApiBearerAuth('auth-part')
    @UseGuards(JWTAuthGuard)
    @Post('create')
    @ApiOperation({summary: 'creation new Post', description: 'crate new post'})
    @ApiBody({type: CretionNewPostSwagger})
    @ApiResponse({status: 201, description: 'creation new post successfully'})
    async handleCreateNewPost(
        @Req() req: Request,
        @Body(new ZodValidationPipe(CreationPostDataSchema)) dto: CreationPostDataType
    ) : Promise<Post_Entity> {
        if (!req.user) throw new UnauthorizedException('you dont have the token')
            
        return await this.postService.creationNewPost({...dto, userId: req.user.userId})
    }

    @ApiCookieAuth()
    @ApiBearerAuth('auth-part')
    @UseGuards(JWTAuthGuard)
    @Patch(":id")
    @ApiOperation({summary: 'update post', description: 'updation this post'})
    @ApiBody({type: UpdationPostSwagger})
    @ApiNotAcceptableResponse({description: 'you update your post succesfully'})
    async handleUpdatePost(
        @Req() req: Request,
        @Param("id") id: string,
        @Body(new ZodValidationPipe(UpdatetingPostDataSchema)) dto: UpdatePostDataType
    ): Promise<Post_Entity> {
        if (!req.user) throw new UnauthorizedException('you dont have token (post)')

        console.log(dto);
        

        return await this.postService.updatePost({...dto, id: Number(id), userId: req.user.userId})
    }

    @ApiCookieAuth()
    @ApiBearerAuth('auth-part')
    @UseGuards(JWTAuthGuard)
    // @Post('delete') ////there need RABBITMQ
    @Delete(":id")
    @ApiOperation({summary: 'delete', description: 'deleted post'})
    @ApiNoContentResponse({description: 'your post delete successfully'})
    async handleDeletePost(
        @Req() req: Request,
        @Param('id') id: string
    ) : Promise<void> {
        if (!req.user) throw new UnauthorizedException('you dont have the token')
        await this.postService.deletePost({id: Number(id), userId: req.user.userId})
    }
}