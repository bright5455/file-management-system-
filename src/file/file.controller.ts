import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload-single')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname)}`)
    })
  }))
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.uploadSingle(file);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 5, {
    storage: diskStorage({
      destination: './uploads',
      filename: (_, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname)}`)
    })
  }))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    return this.fileService.uploadMultiple(files);
  }

  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname)}`)
    })
  }))
  async updateFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.fileService.updateFile(id, file);
  }

  @Delete('delete/:id')
  async deleteFile(@Param('id') id: string) {
    return this.fileService.deleteFile(id);
  }
}

