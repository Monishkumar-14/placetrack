import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'group border bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] shadow-lg',
          description: 'text-[var(--muted-foreground)]',
          actionButton: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
          cancelButton: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
        },
      }}
    />
  )
}
