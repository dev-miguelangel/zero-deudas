const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function LinkIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 15l6-6" />
      <path d="M11 6l1-1a3.5 3.5 0 0 1 5 5l-1 1M13 18l-1 1a3.5 3.5 0 0 1-5-5l1-1" />
    </svg>
  )
}

export function UserIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  )
}

export function KeyIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12 20 3M16 4l3 3M13 7l2.5 2.5" />
    </svg>
  )
}

export function ChevronDownIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function ChevronLeftIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M15 6 9 12l6 6" />
    </svg>
  )
}

export function ChevronRightIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

export function DownloadIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4v11M7 11l5 5 5-5" />
      <path d="M4 19h16" />
    </svg>
  )
}

export function UploadIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 19V8M7 13l5-5 5 5" />
      <path d="M4 19h16" />
    </svg>
  )
}

export function CheckIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12.5 9.5 18 20 6" />
    </svg>
  )
}

export function CheckCircleIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5 11 15.5 16 9" />
    </svg>
  )
}

export function CardIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

export function HomeIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
    </svg>
  )
}

export function ReceiptIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  )
}

export function ListIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  )
}

export function BoltIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" />
    </svg>
  )
}

export function ChartBarIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 21h18" />
      <path d="M6 21v-6M12 21V9M18 21v-11" />
    </svg>
  )
}

export function TableIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M3 10h18M9 4v16" />
    </svg>
  )
}

export function TargetIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function LockIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

export function PlusIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function PencilIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M16.5 4.5a2.1 2.1 0 0 1 3 3L7 20l-4 1 1-4Z" />
    </svg>
  )
}

export function TrashIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    </svg>
  )
}

export function MenuIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function CloseIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function InfoIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  )
}

export function BookIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </svg>
  )
}

export function CatIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="13" r="7" />
      <path d="M6.5 8 5 3l4.5 3.5" />
      <path d="M17.5 8 19 3l-4.5 3.5" />
      <path d="M9.5 13h.01M14.5 13h.01" />
      <path d="M12 15.5v1" />
    </svg>
  )
}

export function DogIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="13" r="7" />
      <path d="M6 9c-2 1-3 4-2 7" />
      <path d="M18 9c2 1 3 4 2 7" />
      <path d="M9.5 13h.01M14.5 13h.01" />
      <path d="M12 15.5v1" />
    </svg>
  )
}

export function RabbitIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="14" r="6" />
      <path d="M9 9C8.3 5 8.5 2 9.7 2S11 5 10.3 9" />
      <path d="M15 9C15.7 5 15.5 2 14.3 2S13 5 13.7 9" />
      <path d="M9.5 14h.01M14.5 14h.01" />
      <path d="M12 16v1" />
    </svg>
  )
}

export function BearIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="13" r="7" />
      <circle cx="7" cy="6" r="2" />
      <circle cx="17" cy="6" r="2" />
      <path d="M9.5 12h.01M14.5 12h.01" />
      <circle cx="12" cy="16" r="1.5" />
    </svg>
  )
}

export function OwlIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="13" r="7" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="15" cy="12" r="2" />
      <path d="M9 6 7.5 3M15 6l1.5-3" />
      <path d="M12 15l-1.2 2h2.4Z" />
    </svg>
  )
}

export function MoneyBagIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M11 6V4.5a1 1 0 0 1 2 0V6" />
      <path d="M9.5 6C6.5 9 5 12 5 15a7 7 0 0 0 14 0c0-3-1.5-6-4.5-9Z" />
      <path d="M12 10.5v7" />
      <path d="M10.3 12.7h3.4M10.3 15.3h3.4" />
    </svg>
  )
}

export function ExclamationIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4 21 19H3Z" />
      <path d="M12 10v4" />
      <path d="M12 16.2h.01" />
    </svg>
  )
}

export function GridIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  )
}

export function DuckIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="15" r="6" />
      <circle cx="15" cy="8" r="4" />
      <path d="M18.5 8.5c1.5 0 2.5.7 2.5 1.6s-1 1.4-2.2 1.2" />
      <circle cx="16.3" cy="6.8" r=".01" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
