import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { File, FileDocument } from 'src/file/schemas/file.schemas';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class FileService {
  constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

  async uploadSingle(file: Express.Multer.File): Promise<File> {
    this.validateFile(file);

    const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: 'uploads',
    });

    const newFile = new this.fileModel({
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      format: uploadResult.format,
      resourceType: uploadResult.resource_type,
      originalName: file.originalname,
      size: file.size,
    });

    return await newFile.save();
  }

  async uploadMultiple(files: Express.Multer.File[]): Promise<File[]> {
    if (files.length > 5) throw new BadRequestException('You can only upload up to 5 files');
    const uploads = await Promise.all(files.map((f) => this.uploadSingle(f)));
    return uploads;
  }

  async updateFile(id: string, file: Express.Multer.File): Promise<File> {
    this.validateFile(file);

    const existing = await this.fileModel.findById(id);
    if (!existing) throw new NotFoundException('File not found');

    await cloudinary.uploader.destroy(existing.publicId);

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: 'uploads',
    });

    existing.publicId = uploadResult.public_id;
    existing.url = uploadResult.secure_url;
    existing.format = uploadResult.format;
    existing.resourceType = uploadResult.resource_type;
    existing.originalName = file.originalname;
    existing.size = file.size;

    return existing.save();
  }

  async deleteFile(id: string): Promise<{ message: string }> {
    const file = await this.fileModel.findById(id);
    if (!file) throw new NotFoundException('File not found');

    await cloudinary.uploader.destroy(file.publicId);
    await file.deleteOne();

    return { message: 'File deleted successfully' };
  }

  private validateFile(file: Express.Multer.File) {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, PDF, and DOC allowed.');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit.');
    }
  }
}

