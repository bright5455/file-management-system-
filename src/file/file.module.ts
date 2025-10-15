import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { File, FileSchema } from 'src/file/schemas/file.schemas';
import { CloudinaryProvider } from './cloudinary.providers';

@Module({
  imports: [MongooseModule.forFeature([{ name: File.name, schema: FileSchema }])],
  controllers: [FileController],
  providers: [FileService, CloudinaryProvider],
})
export class FileModule {}

