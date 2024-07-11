import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/participants/:participantId/confirm', {
    schema: {
      params: z.object({
        participantId: z.string().uuid(),
      })
    }
  }, async (request, reply) => {
    const { participantId } = request.params;

    const participant = await prisma.participant.findUnique({
      where: {
        id: participantId,
      }
    })

    if (!participant) {
      throw new Error('Participant not found.')
    }

    if(participant.is_confirmed) {
      return reply.redirect(`http://localhost:3000/trips/${participant.tripId}`)
    }

    await prisma.participant.update ({
      where: { id: participantId },
      data: { is_confirmed: true},
    })

    return reply.redirect(`http://localhost:3000/trips/${participant.tripId}`)
  })
}
