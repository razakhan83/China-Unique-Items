"use client"

import { Toaster as Sonner } from "sonner"

function Toaster({ ...props }) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        style: { width: '320px', backgroundColor: '#ffffff' },
        className: 'max-w-[320px]',
        classNames: {
          toast:
            "group toast !bg-white !text-foreground !border-border shadow-[0_18px_50px_rgba(10,61,46,0.12)] rounded-xl font-sans",
          title: "group-[.toast]:text-foreground group-[.toast]:font-semibold",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "!bg-primary !text-primary-foreground rounded-lg font-semibold px-4 py-2 shrink-0 ms-auto border border-primary shadow-[0_10px_24px_rgba(10,61,46,0.18)]",
          cancelButton:
            "!bg-secondary !text-muted-foreground rounded-lg border border-border",
          success:
            "!border-success/25 !bg-white",
          error:
            "!border-destructive/25 !bg-white",
          icon: "group-[.toast]:text-primary",
          closeButton: "!bg-white !text-muted-foreground !border-border hover:!bg-muted",
        },
      }}
      richColors
      closeButton={false}
      position="bottom-center"
      expand={false}
      duration={3000}
      {...props}
    />
  )
}

export { Toaster }
