'use client'

import {
  UserCircleIcon,
  SparkleIcon,
  PhoneIcon,
  TrayIcon,
  BellIcon,
  QuestionIcon,
  GearSixIcon,
} from '@phosphor-icons/react'

interface LoftyUtilityRailProps {
  /** Opens Conversation / Lofty AI chat (quick access, same as top tab) */
  onOpenChat?: () => void
  /** Highlight which affordance is “active” in the demo */
  active?: 'ai' | null
}

const BTN =
  'w-8 h-8 flex items-center justify-center rounded-md transition-colors text-ink-500 hover:text-ink-800 hover:bg-ink-100 focus:outline-none'

export default function LoftyUtilityRail({ onOpenChat, active }: LoftyUtilityRailProps) {
  return (
    <aside
      className="shrink-0 w-11 border-l border-ink-200 bg-white flex flex-col items-center py-3 gap-3"
      aria-label="Quick tools"
    >
      <button
        type="button"
        className={BTN}
        title="Profile"
        onClick={() => {}}
      >
        <UserCircleIcon size={17} weight="regular" />
      </button>

      <button
        type="button"
        className={`${BTN} ${active === 'ai' ? 'bg-blue-50 text-blue-600' : ''}`}
        title="Lofty AI"
        onClick={() => onOpenChat?.()}
      >
        <SparkleIcon size={17} weight={active === 'ai' ? 'fill' : 'regular'} />
      </button>

      <button
        type="button"
        className={BTN}
        title="Dialer"
        onClick={() => {}}
      >
        <PhoneIcon size={17} weight="regular" />
      </button>

      <button
        type="button"
        className={BTN}
        title="Messages"
        onClick={() => {}}
      >
        <TrayIcon size={17} weight="regular" />
      </button>

      <button
        type="button"
        className={BTN}
        title="Notifications"
        onClick={() => {}}
      >
        <BellIcon size={17} weight="regular" />
      </button>

      <button
        type="button"
        className={BTN}
        title="Help"
        onClick={() => {}}
      >
        <QuestionIcon size={17} weight="regular" />
      </button>

      <button
        type="button"
        className={BTN}
        title="Settings"
        onClick={() => {}}
      >
        <GearSixIcon size={17} weight="regular" />
      </button>
    </aside>
  )
}
