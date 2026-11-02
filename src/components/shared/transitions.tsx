import { ViewTransition } from 'react';
import type { ReactNode } from 'react';

/** Transition type for moving into a puzzle (tutorial or level). */
export const NAV_FORWARD = 'nav-forward';
/** Transition type for returning to the level list. */
export const NAV_BACK = 'nav-back';

/**
 * View transition classes per navigation type, styled in index.css. Updates without a navigation
 * type (language switches, the splash reveal) don't slide screens.
 */
const SCREEN_TRANSITION = {
  [NAV_FORWARD]: 'screen-forward',
  [NAV_BACK]: 'screen-back',
  default: 'none',
};

type TransitionProps = {
  children: ReactNode;
};

/**
 * Slides a screen in or out in the direction of travel when it mounts or unmounts inside a
 * transition tagged with {@link NAV_FORWARD} or {@link NAV_BACK}.
 *
 * @param props - Component properties
 * @param props.children - The screen content
 */
export const ScreenTransition = ({ children }: TransitionProps) => (
  <ViewTransition enter={SCREEN_TRANSITION} exit={SCREEN_TRANSITION} default="none">
    {children}
  </ViewTransition>
);

/**
 * Fades and scales a dialog in and out when it opens or closes inside a transition.
 *
 * @param props - Component properties
 * @param props.children - The dialog, including its backdrop
 */
export const DialogTransition = ({ children }: TransitionProps) => (
  <ViewTransition enter="dialog-enter" exit="dialog-exit" default="none">
    {children}
  </ViewTransition>
);
