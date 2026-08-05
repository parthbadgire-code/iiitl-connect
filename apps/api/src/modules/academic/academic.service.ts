import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AcademicService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createResource(dto: any, userId: string) {
    return this.databaseService.studyResource.create({
      data: {
        title: dto.title,
        courseCode: dto.courseCode,
        type: dto.type,
        description: dto.description,
        url: dto.fileUrl,
        uploaderId: userId,
      },
    });
  }

  async getAllResources(courseCode?: string, type?: any) {
    return this.databaseService.studyResource.findMany({
      where: {
        ...(courseCode ? { courseCode } : {}),
        ...(type ? { type } : {}),
      },
      include: {
        uploader: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
