import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateOffCampusDto, CreateOAQuestionDto, CreateResumeRequestDto, UpdateResumeRequestDto, CreateInterviewExperienceDto } from './dto/placements.dto';

@Injectable()
export class PlacementsService {
  constructor(private readonly database: DatabaseService) {}

  canReviewResumes(email: string): boolean {
    const regex = /^.+?(2023|2024).*?@iiitl\.ac\.in$/i;
    return regex.test(email);
  }

  // --- Off-Campus Opportunities ---
  async getOffCampusOpportunities() {
    return this.database.offCampusOpportunity.findMany({
      orderBy: { createdAt: 'desc' },
      include: { postedBy: { select: { name: true, image: true } } }
    });
  }

  async createOffCampusOpportunity(data: CreateOffCampusDto, userId: string) {
    return this.database.offCampusOpportunity.create({
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
        postedById: userId,
      }
    });
  }

  // --- OA Questions ---
  async getOAQuestions() {
    return this.database.oAQuestion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { name: true, logo: true } },
        postedBy: { select: { name: true, image: true } }
      }
    });
  }

  async createOAQuestion(data: CreateOAQuestionDto, userId: string) {
    let companyId = data.companyId;

    // Check if companyId is an actual ID, else try to find/create it by name
    let company = await this.database.company.findUnique({ where: { id: companyId } }).catch(() => null);
    if (!company) {
      company = await this.database.company.findFirst({
        where: { name: { equals: companyId, mode: 'insensitive' } }
      });
      if (!company) {
        company = await this.database.company.create({
          data: { name: companyId }
        });
      }
      companyId = company.id;
    }

    return this.database.oAQuestion.create({
      data: {
        ...data,
        companyId: companyId,
        postedById: userId,
      }
    });
  }

  // --- Resume Reviews ---
  async getResumeRequests() {
    return this.database.resumeReviewRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { name: true, image: true, email: true } },
        reviewer: { select: { name: true, image: true, email: true } }
      }
    });
  }

  async createResumeRequest(data: CreateResumeRequestDto, userId: string) {
    return this.database.resumeReviewRequest.create({
      data: {
        ...data,
        requesterId: userId,
      }
    });
  }

  async updateResumeRequest(id: string, data: UpdateResumeRequestDto, userId: string) {
    const user = await this.database.user.findUnique({ where: { id: userId } });
    if (!user || !this.canReviewResumes(user.email)) {
      throw new ForbiddenException("Only 2023 and 2024 batch students can review resumes.");
    }
    
    return this.database.resumeReviewRequest.update({
      where: { id },
      data: {
        ...data,
        reviewerId: userId,
      }
    });
  }

  async deleteResumeFeedback(id: string, userId: string) {
    const request = await this.database.resumeReviewRequest.findUnique({ where: { id } });
    if (!request) throw new ForbiddenException('Request not found');
    
    // Only the reviewer who provided the feedback can delete it
    if (request.reviewerId !== userId) {
      throw new ForbiddenException('You can only delete your own feedback');
    }

    return this.database.resumeReviewRequest.update({
      where: { id },
      data: {
        feedback: null,
        rating: null,
        reviewerId: null,
        status: 'PENDING',
      }
    });
  }

  // --- Interview Experiences ---
  async getInterviewExperiences() {
    return this.database.interviewExperience.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { name: true, logo: true } },
        user: { select: { name: true, image: true } },
        anonymousIdentity: { select: { avatarSeed: true } }
      }
    });
  }

  async createInterviewExperience(data: CreateInterviewExperienceDto, userId: string) {
    return this.database.interviewExperience.create({
      data: {
        ...data,
        userId: data.anonymousIdentityId ? null : userId,
      }
    });
  }
}
