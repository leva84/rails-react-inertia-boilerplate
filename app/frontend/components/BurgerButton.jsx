export default function BurgerButton({ isOpen, onToggle }) {
  return (
    <div className="-mr-2 flex items-center md:hidden">
      <button onClick={onToggle} className="burger-btn">
        <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>

        <svg
          className="block h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {/* Render different icons based on the isOpen prop */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
          />
        </svg>
      </button>
    </div>
  )
}
