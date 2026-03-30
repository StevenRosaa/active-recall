"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { Sun, Moon } from "lucide-react"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  withThemeIcon,
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
  withThemeIcon?: boolean
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[22px] data-[size=default]:w-[42px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-zinc-200 dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none group/thumb flex items-center justify-center rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-[18px] group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%+2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-[2px] group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground relative overflow-hidden"
      >
        {withThemeIcon && (
          <>
            <Sun className="absolute w-[10px] h-[10px] text-zinc-900 dark:text-yellow-600 transition-all scale-100 opacity-100 group-data-checked/thumb:scale-0 group-data-checked/thumb:opacity-0" />
            <Moon className="absolute w-[10px] h-[10px] text-zinc-900 transition-all scale-0 opacity-0 group-data-checked/thumb:scale-100 group-data-checked/thumb:opacity-100" />
          </>
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
