/** Chevron down when closed; parent `.pb-privateToggle.is-open` rotates 180° → up. */
export default function PrivateToggleChevron() {
  return (
    <svg
      className="pb-privateToggle__chevronSvg"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
