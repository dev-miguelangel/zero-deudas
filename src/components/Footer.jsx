export default function Footer() {
  return (
    <footer
      className="border-t border-slate-200 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500">
        ZeroDeudas &copy; {new Date().getFullYear()}
      </div>
    </footer>
  )
}
