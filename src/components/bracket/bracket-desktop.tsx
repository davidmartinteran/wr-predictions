"use client";

import { Trophy } from "lucide-react";
import { TeamFlag } from "@/components/team-flag";
import { BracketMatchCard } from "./bracket-match";
import { STAGES, STAGE_LABELS, STAGE_MATCH_COUNTS, type Stage } from "@/lib/bracket/mapping";
import type { BracketMatch, BracketState } from "@/lib/bracket/engine";

type Props = {
  bracketState: BracketState;
  disabled: boolean;
  onPickWinner: (stage: Stage, slot: number, teamId: string) => void;
};

const INACTIVE = "rgba(39,39,42,0.5)";
const ACTIVE = "rgba(27,158,91,0.7)";
const CARD_W = 180;
const CONNECTOR_W = 32;

export function BracketDesktopView({ bracketState, disabled, onPickWinner }: Props) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {bracketState.champion && (
        <div className="shrink-0 flex justify-end px-6 py-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-primary/40 bg-primary/8 px-4 py-2.5">
            <Trophy className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Tu campeón</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <TeamFlag code={bracketState.champion.code} size={16} className="shrink-0" />
                <span className="text-[13px] font-semibold text-zinc-50 truncate">
                  {bracketState.champion.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto scrollbar-thin px-6 pt-4 pb-6">
        {/* Stage headers */}
        <div className="flex mb-3">
          {STAGES.map((stage, si) => {
            const filled = bracketState.matches[stage].filter((m) => m.winner).length;
            const total = STAGE_MATCH_COUNTS[stage];
            return (
              <div
                key={stage}
                className="shrink-0"
                style={{ width: CARD_W, marginLeft: si > 0 ? CONNECTOR_W : 0 }}
              >
                <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-medium truncate">
                  {STAGE_LABELS[stage]}
                </div>
                <div className="text-[9px] text-zinc-600 tabular-nums">
                  {filled}/{total}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recursive bracket tree */}
        <BracketNode
          bracketState={bracketState}
          stageIdx={STAGES.length - 1}
          slot={0}
          disabled={disabled}
          onPickWinner={onPickWinner}
        />
      </div>
    </div>
  );
}

function BracketNode({
  bracketState,
  stageIdx,
  slot,
  disabled,
  onPickWinner,
}: {
  bracketState: BracketState;
  stageIdx: number;
  slot: number;
  disabled: boolean;
  onPickWinner: (stage: Stage, slot: number, teamId: string) => void;
}) {
  const stage = STAGES[stageIdx];
  const match = bracketState.matches[stage][slot];

  // Base case: first stage (R32) — just a card
  if (stageIdx === 0) {
    return (
      <div className="shrink-0 flex items-center" style={{ width: CARD_W }}>
        <div className="w-full">
          <BracketMatchCard
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            winner={match.winner}
            disabled={disabled}
            onPickWinner={(teamId) => onPickWinner(stage, slot, teamId)}
          />
        </div>
      </div>
    );
  }

  // Recursive: two parent subtrees → connector → this card
  const parentStageIdx = stageIdx - 1;
  const parentStage = STAGES[parentStageIdx];
  const topSlot = slot * 2;
  const botSlot = slot * 2 + 1;
  const topResolved = !!bracketState.matches[parentStage][topSlot]?.winner;
  const botResolved = !!bracketState.matches[parentStage][botSlot]?.winner;
  const bothResolved = topResolved && botResolved;

  return (
    <div className="flex items-stretch">
      {/* Parent subtrees stacked */}
      <div className="flex flex-col gap-1 shrink-0">
        <div className="flex-1">
          <BracketNode
            bracketState={bracketState}
            stageIdx={parentStageIdx}
            slot={topSlot}
            disabled={disabled}
            onPickWinner={onPickWinner}
          />
        </div>
        <div className="flex-1">
          <BracketNode
            bracketState={bracketState}
            stageIdx={parentStageIdx}
            slot={botSlot}
            disabled={disabled}
            onPickWinner={onPickWinner}
          />
        </div>
      </div>

      {/* Connector */}
      <div
        className="shrink-0 relative flex flex-col gap-1"
        style={{ width: CONNECTOR_W }}
      >
        <div className="flex-1 relative flex items-center">
          <div
            className="w-1/2 h-0 border-t-[1.5px]"
            style={{ borderColor: topResolved ? ACTIVE : INACTIVE }}
          />
          <div
            className="absolute w-0 border-l-[1.5px]"
            style={{
              borderColor: topResolved ? ACTIVE : INACTIVE,
              top: "50%",
              bottom: -2,
              left: "50%",
            }}
          />
        </div>
        <div className="flex-1 relative flex items-center">
          <div
            className="w-1/2 h-0 border-t-[1.5px]"
            style={{ borderColor: botResolved ? ACTIVE : INACTIVE }}
          />
          <div
            className="absolute w-0 border-l-[1.5px]"
            style={{
              borderColor: botResolved ? ACTIVE : INACTIVE,
              top: -2,
              bottom: "50%",
              left: "50%",
            }}
          />
        </div>
        <div
          className="absolute h-0 border-t-[1.5px]"
          style={{
            borderColor: bothResolved ? ACTIVE : INACTIVE,
            top: "50%",
            left: "50%",
            right: 0,
          }}
        />
      </div>

      {/* This match card */}
      <div className="shrink-0 flex items-center" style={{ width: CARD_W }}>
        <div className="w-full">
          <BracketMatchCard
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            winner={match.winner}
            disabled={disabled}
            onPickWinner={(teamId) => onPickWinner(stage, slot, teamId)}
          />
        </div>
      </div>
    </div>
  );
}
