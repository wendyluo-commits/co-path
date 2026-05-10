'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Loader2, AlertCircle, Grab, MoveHorizontal, CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface GestureHUDProps {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  isHandVisible: boolean;
  isPinching: boolean;
  awaitingFanSpread: boolean;
  isShuffled: boolean;
  isDragging: boolean;
  allCardsFilled: boolean;
  isShuffling: boolean;
}

type Instruction = {
  id: string;
  Icon: LucideIcon;
  text: string;
  sub: string;
  accent: string;
  spin?: boolean;
};

function getInstruction(p: GestureHUDProps): Instruction | null {
  if (p.error) return {
    id: 'error', Icon: AlertCircle,
    text: 'Camera error', sub: 'Check camera permissions', accent: 'text-red-300'
  };
  if (p.isLoading) return {
    id: 'loading', Icon: Loader2,
    text: 'Loading hand detection', sub: 'Please wait a moment', accent: 'text-white/60', spin: true
  };
  if (!p.isReady) return null;
  if (!p.isHandVisible) return {
    id: 'show-hand', Icon: Hand,
    text: 'Show your hand', sub: 'Hold your palm toward the camera', accent: 'text-violet-300'
  };
  if (p.isShuffling) return {
    id: 'shuffling', Icon: Loader2,
    text: 'Shuffling cards', sub: 'Cards are being arranged', accent: 'text-violet-300', spin: true
  };
  if (p.awaitingFanSpread) return {
    id: 'fan', Icon: MoveHorizontal,
    text: 'Open palm, sweep right', sub: 'Spread the cards into a fan', accent: 'text-violet-300'
  };
  if (p.isDragging) return {
    id: 'drag', Icon: Grab,
    text: 'Pinching — move to a slot', sub: 'Release your fingers to drop', accent: 'text-amber-300'
  };
  if (p.isShuffled && !p.allCardsFilled) return {
    id: 'pick', Icon: Hand,
    text: 'Pinch a card to pick it up', sub: 'Move hand to browse · drop on slot', accent: 'text-violet-300'
  };
  if (p.allCardsFilled) return {
    id: 'ready', Icon: CheckCircle,
    text: 'All cards selected', sub: 'Tap "Start Reading" to begin', accent: 'text-emerald-300'
  };
  return null;
}

export function GestureHUD(props: GestureHUDProps) {
  const instr = getInstruction(props);

  return (
    <AnimatePresence mode="wait">
      {instr && (
        <motion.div
          key={instr.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
          className="pointer-events-none fixed bottom-16 left-1/2 z-[80] -translate-x-1/2"
        >
          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-black/65 px-3.5 py-2 shadow-xl backdrop-blur-md">
            <instr.Icon
              className={`h-4 w-4 shrink-0 ${instr.accent} ${instr.spin ? 'animate-spin' : ''}`}
              strokeWidth={1.8}
            />
            <div>
              <p className={`text-[11px] font-semibold leading-tight ${instr.accent}`}>{instr.text}</p>
              <p className="text-[10px] text-white/35 leading-tight mt-0.5">{instr.sub}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
