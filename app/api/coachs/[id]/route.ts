import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auditMutation } from "@/lib/api-audit";

type MemberAssignment = { memberId: number; coachId: number };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const coachId = Number(id);

    if (!Number.isInteger(coachId) || coachId <= 0) {
      return NextResponse.json({ error: "Coach invalide" }, { status: 400 });
    }

    const coach = await prisma.coach.findUnique({ where: { id: coachId } });
    if (!coach) {
      return NextResponse.json({ error: "Coach introuvable" }, { status: 404 });
    }

    const [membersList, presences, seances, autresCoachs] = await Promise.all([
      prisma.clubMember.findMany({
        where: { coachReferentId: coachId },
        orderBy: [{ prenom: "asc" }, { nom: "asc" }],
        select: { id: true, prenom: true, nom: true, estVip: true, actif: true },
      }),
      prisma.presence.count({ where: { coachId } }),
      prisma.seanceClub.count({ where: { coachId } }),
      prisma.coach.findMany({
        where: { id: { not: coachId } },
        orderBy: [{ ordre: "asc" }, { prenom: "asc" }],
        select: { id: true, prenom: true, nom: true },
      }),
    ]);

    return NextResponse.json({
      coach,
      members: membersList,
      linked: {
        members: membersList.length,
        presences,
        seances,
      },
      autresCoachs,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    const coach = await prisma.coach.update({
      where: {
        id: Number(id),
      },
      data: {
        prenom: body.prenom,
        nom: body.nom,
        telephone: body.telephone,
        facebook: body.facebook,
        description: body.description,
        image: body.image,
      },
    });

    await auditMutation(request, {
      action: "UPDATE",
      entity: "coach",
      entityId: coach.id,
      details: `${coach.prenom} ${coach.nom}`,
    });

    return NextResponse.json(coach);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const coachId = Number(id);

    if (!Number.isInteger(coachId) || coachId <= 0) {
      return NextResponse.json({ error: "Coach invalide" }, { status: 400 });
    }

    const coach = await prisma.coach.findUnique({ where: { id: coachId } });
    if (!coach) {
      return NextResponse.json({ error: "Coach introuvable" }, { status: 404 });
    }

    let reassignTo: number | null = null;
    let memberAssignments: MemberAssignment[] = [];
    let seancesCoachId: number | null = null;

    try {
      const body = await request.json();
      if (body?.reassignTo != null) reassignTo = Number(body.reassignTo);
      if (Array.isArray(body?.memberAssignments)) {
        memberAssignments = body.memberAssignments
          .map((a: { memberId?: number; coachId?: number }) => ({
            memberId: Number(a.memberId),
            coachId: Number(a.coachId),
          }))
          .filter(
            (a: MemberAssignment) =>
              Number.isInteger(a.memberId) &&
              a.memberId > 0 &&
              Number.isInteger(a.coachId) &&
              a.coachId > 0 &&
              a.coachId !== coachId
          );
      }
      if (body?.seancesCoachId != null) {
        seancesCoachId = Number(body.seancesCoachId);
      }
    } catch {
      /* DELETE sans body */
    }

    const linkedMembers = await prisma.clubMember.findMany({
      where: { coachReferentId: coachId },
      select: { id: true },
    });
    const memberIds = linkedMembers.map((m) => m.id);

    const [presences, seances] = await Promise.all([
      prisma.presence.count({ where: { coachId } }),
      prisma.seanceClub.count({ where: { coachId } }),
    ]);

    const linked = memberIds.length + presences + seances;

    if (linked > 0) {
      const hasPerMember =
        memberIds.length > 0 &&
        memberAssignments.length === memberIds.length &&
        memberAssignments.every((a) => memberIds.includes(a.memberId));

      const canBulkReassign = reassignTo && reassignTo !== coachId;

      if (memberIds.length > 0 && !hasPerMember && !canBulkReassign) {
        return NextResponse.json(
          {
            error: `Réassignez les ${memberIds.length} client${memberIds.length > 1 ? "s" : ""} avant de supprimer.`,
            members: memberIds.length,
            presences,
            seances,
          },
          { status: 409 }
        );
      }

      if (seances > 0 && !seancesCoachId && !canBulkReassign) {
        return NextResponse.json(
          {
            error: "Choisissez un coach pour les séances collectives liées.",
            seances,
          },
          { status: 409 }
        );
      }

      const ops: Prisma.PrismaPromise<unknown>[] = [];

      if (hasPerMember) {
        for (const { memberId, coachId: newCoachId } of memberAssignments) {
          const target = await prisma.coach.findUnique({
            where: { id: newCoachId },
          });
          if (!target) {
            return NextResponse.json(
              { error: "Coach de remplacement introuvable" },
              { status: 400 }
            );
          }
          ops.push(
            prisma.clubMember.update({
              where: { id: memberId },
              data: { coachReferentId: newCoachId },
            }),
            prisma.presence.updateMany({
              where: { memberId, coachId },
              data: { coachId: newCoachId },
            })
          );
        }
      } else if (canBulkReassign && memberIds.length > 0) {
        ops.push(
          prisma.clubMember.updateMany({
            where: { coachReferentId: coachId },
            data: { coachReferentId: reassignTo! },
          }),
          prisma.presence.updateMany({
            where: { coachId },
            data: { coachId: reassignTo! },
          })
        );
      } else if (presences > 0 && canBulkReassign) {
        ops.push(
          prisma.presence.updateMany({
            where: { coachId },
            data: { coachId: reassignTo! },
          })
        );
      }

      const seancesTarget = seancesCoachId ?? reassignTo;
      if (seances > 0 && seancesTarget) {
        const target = await prisma.coach.findUnique({
          where: { id: seancesTarget },
        });
        if (!target) {
          return NextResponse.json(
            { error: "Coach pour les séances introuvable" },
            { status: 400 }
          );
        }
        ops.push(
          prisma.seanceClub.updateMany({
            where: { coachId },
            data: { coachId: seancesTarget },
          })
        );
      }

      if (ops.length > 0) {
        await prisma.$transaction(ops);
      }

      const leftoverPresences = await prisma.presence.count({
        where: { coachId },
      });
      if (leftoverPresences > 0) {
        const fallback =
          seancesCoachId ??
          reassignTo ??
          memberAssignments[0]?.coachId;
        if (!fallback) {
          return NextResponse.json(
            {
              error: `${leftoverPresences} présence(s) restent liées à ce coach.`,
            },
            { status: 409 }
          );
        }
        await prisma.presence.updateMany({
          where: { coachId },
          data: { coachId: fallback },
        });
      }

      const remaining = await prisma.clubMember.count({
        where: { coachReferentId: coachId },
      });
      if (remaining > 0) {
        return NextResponse.json(
          { error: "Des clients n'ont pas été réassignés." },
          { status: 409 }
        );
      }
    }

    await prisma.coach.delete({ where: { id: coachId } });

    await auditMutation(request, {
      action: "DELETE",
      entity: "coach",
      entityId: coachId,
      details: `${coach.prenom} ${coach.nom}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}