import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';

@Injectable()
export class AcademicService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notifications: NotificationsService
  ) {}

  async createResource(dto: any, userId: string) {
    const resource = await this.databaseService.studyResource.create({
      data: {
        title: dto.title,
        courseCode: dto.courseCode,
        semester: dto.semester,
        type: dto.type,
        examType: dto.examType,
        year: dto.year,
        description: dto.description,
        url: dto.fileUrl,
        uploaderId: userId,
      },
      include: {
        uploader: { select: { name: true } }
      }
    });

    this.notifications.createGlobalNotification({
      title: 'New Academic Resource!',
      message: `${resource.uploader.name} just uploaded a new ${dto.type} for ${dto.courseCode}.`,
      type: NotificationType.ACADEMIC,
      link: '/academic',
    }).catch(console.error);

    return resource;
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

  async updateResource(id: string, dto: any, user: any) {
    const resource = await this.databaseService.studyResource.findUnique({ where: { id } });
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (user.role !== 'SUPER_ADMIN' && resource.uploaderId !== user.id) {
      throw new ForbiddenException('You do not have permission to edit this resource');
    }

    return this.databaseService.studyResource.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title : undefined,
        courseCode: dto.courseCode !== undefined ? dto.courseCode : undefined,
        semester: dto.semester !== undefined ? dto.semester : undefined,
        type: dto.type !== undefined ? dto.type : undefined,
        examType: dto.examType !== undefined ? dto.examType : undefined,
        year: dto.year !== undefined ? dto.year : undefined,
        description: dto.description !== undefined ? dto.description : undefined,
      },
    });
  }

  async deleteResource(id: string, user: any) {
    const resource = await this.databaseService.studyResource.findUnique({ where: { id } });
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (user.role !== 'SUPER_ADMIN' && resource.uploaderId !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this resource');
    }

    return this.databaseService.studyResource.delete({
      where: { id },
    });
  }
}
