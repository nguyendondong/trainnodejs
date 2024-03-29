import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Query,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  BadGatewayException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthGuard } from "@/auth/auth.guard";
import Helpers from "@/utils/TransformDataUtils";
import { SearchDto } from "@/users/dto/search.dto";
import { CreateUserDto, ResponseUserDto } from "@/users/dto/create-user.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { storage } from "@/config/storage.config";
import { CsvService } from "@/csv/csv.service";
import { QueuesName } from "@/worker/queues";
import { I18nService } from "nestjs-i18n";

@ApiBearerAuth()
@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly csvService: CsvService,
    private readonly i18n: I18nService
  ) {}

  @Post("/register")
  register(@Body() createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() searchDto: SearchDto) {
    return this.usersService.findAll(searchDto);
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  @UseInterceptors(FileInterceptor("avatar"))
  async update(
    @Param("id") id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif)$/,
          }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    return this.usersService.update(id, updateUserDto, file);
  }

  @UseGuards(AuthGuard)
  @Get("/details/:id")
  async findOne(@Param("id") id: string) {
    const user = await this.usersService.findById(Number(id));

    return Helpers.transformDataEnitity(ResponseUserDto, user);
  }

  @UseGuards(AuthGuard)
  @Get("/profile")
  getProfile(@Req() req: any) {
    return req.user;
  }

  // @Delete(":id")
  // remove(@Param("id") id: string) {
  // return this.usersService.remove(+id);
  // }

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor("userCsv", { storage }))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: "text/csv",
          }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    try {
      if (file.size > 5 * 1024 * 1024) {
        return await this.csvService.createUserByCsv(file);
      } else {
        await this.csvService.CronJobcreaUserByCsv(
          QueuesName.createUserByCsv,
          file
        );
      }
    } catch (error) {
      throw new BadGatewayException();
    }
  }
}
